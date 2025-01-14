import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { DatabaseModule } from './database/module';
import { ConfigModule } from './config/module';
import { PlaygroundCommand } from './utils/playground';
import { SentryLoggerService } from './utils/sentry/sentry-logger.service';
import { PrometheusService } from './utils/prometheus/prometheus.service';

import { EscrowModule } from './escrow/module';
import { SettingsController, SettingsService } from './settings';
import { OffersController, OffersService } from './offers';
import { TradesController, TradesService } from './trades';
import { HealthController, HealthService } from './utils/health';
import { MetricsController, MetricsService } from './utils/metrics';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'blockchain'),
    }),
    SentryLoggerService(),
    DatabaseModule,
    HttpModule,
    ConfigModule,
    CommandModule,
    EscrowModule,
    TerminusModule,
  ],
  controllers: [OffersController, TradesController, SettingsController, HealthController, MetricsController],
  providers: [OffersService, TradesService, PlaygroundCommand, SettingsService, HealthService, MetricsService, PrometheusService],
})
export class AppModule {}
