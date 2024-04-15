import type { IReport } from '../DB/Models/Report';
import ReportModel from '../DB/Models/Report';
import { ReportTypes } from '../DB/Models/report-types.enum';
import { DecisionPoints } from './decision-points';
import { SNSService } from './SNS';

class DecisionService {

  public static async newReport(report: IReport) {
    try {
      const { postId } = report;

      // check if there is any negative report
      const negativeReportsCounts = await ReportModel.countDocuments({
        postId,
        type: { $in: [ReportTypes.notFound, ReportTypes.misleading, ReportTypes.outOfStock] }
      });

      if (!negativeReportsCounts) return;

      // Calculated the confirmation after negative report
      const negativeReports = await ReportModel.find({
        postId,
        type: { $in: [ReportTypes.notFound, ReportTypes.misleading, ReportTypes.outOfStock] },
      }).sort({
        createdAt: 'asc'
      });

      console.log('negativeReports', negativeReports);

      const firstNegativeReport = negativeReports[0];
      console.log('firstNegativeReport', firstNegativeReport);

      const confirmationCountsAfterFirstNegative = await ReportModel.countDocuments({
        postId,
        type: ReportTypes.confirmation,
        createdAt: {
          $gte: firstNegativeReport.createdAt
        }
      });
      console.log('confirmationCountsAfterFirstNegative', confirmationCountsAfterFirstNegative);


      const reportCountPromises = Object.values(ReportTypes).map(async reportType => {
        if (reportType !== ReportTypes.confirmation) {
          const reportCount = await ReportModel.countDocuments({
            postId,
            type: reportType
          });
          return {
            reportType,
            reportCount
          };
        }
      });

      const reportCounts = await Promise.all(reportCountPromises);

      console.log('reportCounts', reportCounts);

      const totalReportScore = reportCounts.reduce((previousValue, currentValue) => {
        if (currentValue) {
          console.log('currentValue', currentValue.reportCount * DecisionPoints[currentValue!.reportType]);
          return previousValue + (currentValue.reportCount * DecisionPoints[currentValue.reportType]);
        }
        return previousValue;
      }, -confirmationCountsAfterFirstNegative * DecisionPoints[ReportTypes.confirmation]);

      // @ts-ignore
      if (totalReportScore > parseInt(process.env.DECISION_THRESHOLD, 10)){
        await SNSService.blockPost(postId);
        console.log('Blocked Post', postId);
      }
    } catch (error) {
      console.error('newReport-decisionService', error);
    }
  }
}

export {
  DecisionService
};