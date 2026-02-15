import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { IIssue, ITopIssue, IExtractedContent } from '../interfaces/IReview';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 2048 })
  url: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'int', nullable: true })
  score: number | null;

  @Column({ type: 'jsonb' })
  issues: IIssue[];

  @Column({ type: 'jsonb' })
  topThreeIssues: ITopIssue[];

  @Column({ type: 'jsonb' })
  extractedContent: IExtractedContent;

  @Column({ type: 'text', nullable: true })
  screenshotPath: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
