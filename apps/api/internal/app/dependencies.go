package app

import (
	"database/sql"

	"github.com/celal2344/orthodontics-helper/apps/api/internal/features/appointments"
	"github.com/celal2344/orthodontics-helper/apps/api/internal/features/audit"
	"github.com/celal2344/orthodontics-helper/apps/api/internal/features/auth"
	"github.com/celal2344/orthodontics-helper/apps/api/internal/features/clinics"
	"github.com/celal2344/orthodontics-helper/apps/api/internal/features/patients"
	smsfeature "github.com/celal2344/orthodontics-helper/apps/api/internal/features/sms"
	"github.com/celal2344/orthodontics-helper/apps/api/internal/features/users"
	"github.com/celal2344/orthodontics-helper/apps/api/internal/platform/config"
	smsplatform "github.com/celal2344/orthodontics-helper/apps/api/internal/platform/sms"
	"go.uber.org/zap"
)

type Dependencies struct {
	Config config.Config
	Logger *zap.Logger
	DB     *sql.DB

	AuthHandler        *auth.Handler
	ClinicHandler      *clinics.Handler
	UserHandler        *users.Handler
	PatientHandler     *patients.Handler
	AppointmentHandler *appointments.Handler
	SMSHandler         *smsfeature.Handler
	AuditHandler       *audit.Handler
	ReminderService    *smsfeature.ReminderService
}

func NewDependencies(cfg config.Config, log *zap.Logger, conn *sql.DB) *Dependencies {
	auditRepository := audit.NewRepository(conn)
	auditService := audit.NewService(auditRepository)

	smsRepository := smsfeature.NewRepository(conn)
	smsProvider := smsfeature.NewProviderAdapter(smsplatform.NewNoopProvider(log))
	reminderService := smsfeature.NewReminderService(smsRepository, smsProvider, auditService, log)

	authService := auth.NewService(auth.NewRepository(conn))

	return &Dependencies{
		Config: cfg,
		Logger: log,
		DB:     conn,

		AuthHandler:        auth.NewHandler(authService),
		ClinicHandler:      clinics.NewHandler(clinics.NewService(clinics.NewRepository(conn))),
		UserHandler:        users.NewHandler(users.NewService(users.NewRepository(conn))),
		PatientHandler:     patients.NewHandler(patients.NewService(patients.NewRepository(conn), auditService), authService),
		AppointmentHandler: appointments.NewHandler(appointments.NewService(appointments.NewRepository(conn), auditService)),
		SMSHandler:         smsfeature.NewHandler(smsfeature.NewService(smsRepository, smsProvider, auditService)),
		AuditHandler:       audit.NewHandler(auditService),
		ReminderService:    reminderService,
	}
}
