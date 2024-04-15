import { ReportTypes } from '../DB/Models/report-types.enum';

export const DecisionPoints = {
  [ReportTypes.misleading]: 5,
  [ReportTypes.outOfStock]: 3,
  [ReportTypes.notFound]: 2,
  [ReportTypes.confirmation]: 4
};