import type mongoose from 'mongoose';
import type { IReport } from '../DB/Models/Report';
import ReportModel from '../DB/Models/Report';
import { DecisionService } from './Decision';

class ReportService {

  static async createReportWithGivenPostId(report: IReport, reportId: mongoose.Types.ObjectId) {
    try {
      const existingReport = await this.findById(reportId);
      if (existingReport) {
        console.error('Report With Given Id already exists');
        return;
      }

      const newReport = await new ReportModel({ ...report }).save();
      await DecisionService.newReport(newReport);

      return newReport;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id: string | mongoose.Types.ObjectId) {
    return ReportModel.findById(id);
  }
}

export {
  ReportService
};