import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry, Cron, CronExpression } from '@nestjs/schedule';
import AWS from 'aws-sdk';
import { DateTime } from 'luxon';

@Injectable()
export class AppService {
	
  private readonly logger = new Logger(AppService.name);
  private config = new AWS.Config();

  constructor(private scheduler: SchedulerRegistry, private configService: ConfigService) {
	const secretAccessKey: string = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
	const defaultRegion: string = this.configService.get<string>('AWS_DEFAULT_REGION');
	const accessKeyId: string = this.configService.get<string>('AWS_ACCESS_KEY_ID');
	this.config.update({ region: defaultRegion, accessKeyId: accessKeyId, secretAccessKey: secretAccessKey });
  }

  getCronDetails(): any {
	/* const jobs = this.scheduler.getCronJobs();
	
	jobs.forEach((value, key, map) => {
		let next;
		try {
		  next = value.nextDates().toDate();
		} catch (e) {
		  next = 'error: next fire date is in the past!';
		}
		this.logger.log(`job: ${key} -> next: ${next}`);
	}); */
	
	const job = this.scheduler.getCronJob('rds');
	this.logger.log(`Querying the current job details : ${job}`);
	const jobObj = { lastRun: this.getLastRunDate(job), nextRuns: job.nextDates(5) }
	return jobObj;
  }

  @Cron('0 0 9 */7 * *', {
	name: 'rds',
	timeZone: 'Asia/Kolkata',
  })
  triggerRDS() {
	const rds = new AWS.RDS(this.config);
	const activity = rds.describeDBInstances();
	this.logger.log(`Stop request started at ${activity.startTime}`);
	activity.promise().then(data => {
		data.DBInstances.forEach(inst => {
			let instanceStatus = inst.DBInstanceStatus;
			let instanceId = inst.DBInstanceIdentifier;
			if (instanceStatus === 'available') {
				rds.stopDBInstance({ DBInstanceIdentifier: instanceId }).promise().then(response => {
					this.logger.log(`Instance status : ${response.DBInstance.DBInstanceStatus}`);
					this.logger.log(`Instance ARN : ${response.DBInstance.DBInstanceArn}`);
				});
			} else {
				this.logger.log(`The instance is already stopped. Next run after 7 days.`)
			}
		});
	}).catch(err => this.logger.error(`${err}`));
  }

  private getLastRunDate(job: any): string | null {
	return job.lastDate() !== null ? DateTime.fromISO(job.lastDate()).toISODate() : null;
  }
}
