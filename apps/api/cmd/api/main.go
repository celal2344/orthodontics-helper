package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/celal2344/orthodontics-helper/apps/api/internal/app"
	"github.com/celal2344/orthodontics-helper/apps/api/internal/platform/config"
	"github.com/celal2344/orthodontics-helper/apps/api/internal/platform/db"
	"github.com/celal2344/orthodontics-helper/apps/api/internal/platform/logger"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	command := "server"
	if len(os.Args) > 1 {
		command = os.Args[1]
	}

	if err := run(ctx, command); err != nil {
		fmt.Fprintf(os.Stderr, "api: %v\n", err)
		os.Exit(1)
	}
}

func run(ctx context.Context, command string) error {
	cfg := config.Load()

	log, err := logger.New(cfg.AppEnv)
	if err != nil {
		return fmt.Errorf("create logger: %w", err)
	}
	defer log.Sync() //nolint:errcheck

	conn, err := db.Open(ctx, cfg.DatabaseURL)
	if err != nil {
		return fmt.Errorf("open database: %w", err)
	}
	defer conn.Close()

	deps := app.NewDependencies(cfg, log, conn)

	switch command {
	case "server":
		return serve(ctx, deps)
	case "send-daily-reminders":
		return deps.ReminderService.SendDailyReminders(ctx)
	default:
		return fmt.Errorf("unknown command %q", command)
	}
}

func serve(ctx context.Context, deps *app.Dependencies) error {
	server := app.NewServer(deps)

	errCh := make(chan error, 1)
	go func() {
		errCh <- server.ListenAndServe()
	}()

	select {
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := server.Shutdown(shutdownCtx); err != nil {
			return fmt.Errorf("shutdown server: %w", err)
		}
		return nil
	case err := <-errCh:
		if errors.Is(err, http.ErrServerClosed) {
			return nil
		}
		return err
	}
}
