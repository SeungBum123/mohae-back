import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeORMConfig } from './configs/typeorm.config';
import { ReportsModule } from './reports/reports.module';
import { FaqsModule } from './faqs/faqs.module';
import { CategoriesModule } from './categories/categories.module';
import { BoardsModule } from './boards/boards.module';
import { AreasModule } from './areas/areas.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SchoolsModule } from './schools/schools.module';
import { MajorsModule } from './majors/majors.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { NotesModule } from './notes/notes.module';

@Module({
  imports: [
    ReportsModule,
    FaqsModule,
    CategoriesModule,
    BoardsModule,
    AreasModule,
    ReviewsModule,
    SchoolsModule,
    MajorsModule,
    AuthModule,
    TypeOrmModule.forRoot(typeORMConfig),
    ProfilesModule,
    NotesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
