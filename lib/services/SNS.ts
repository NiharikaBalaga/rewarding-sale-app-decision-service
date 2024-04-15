import type { PublishCommandInput } from '@aws-sdk/client-sns';
import { PublishCommand } from '@aws-sdk/client-sns';
import { SNSClient } from '@aws-sdk/client-sns';
import type mongoose from 'mongoose';
import { Events } from './events.enum';


class SNSService {

  private static readonly SNS: SNSClient = new SNSClient({
    apiVersion: 'version',
    region: process.env.aws_region,
    credentials: {
      accessKeyId: process.env.aws_sns_access_key_id || '',
      secretAccessKey: process.env.aws_sns_secret_access_key || '',
    },
  });

  private static async _publishToDecisionTopicARN(Message: string, groupId: string) { // groupId should be POST ID of report
    try {
      const messageParams: PublishCommandInput = {
        Message,
        TopicArn: process.env.DECISION_TOPIC_SNS_ARN,
        MessageGroupId: groupId,
      };

      const { MessageId } = await this.SNS.send(
        new PublishCommand(messageParams),
      );
      console.log('_publishToReportTopicARN-success', MessageId);
    } catch (_publishToReportTopicARNError) {
      console.error(
        '_publishToReportTopicARNError',
        _publishToReportTopicARNError,
      );
    }
  }

  static async blockPost(postId: string | mongoose.Types.ObjectId) {
    const EVENT_TYPE = Events.blockPost;
    const snsMessage = Object.assign({ EVENT_TYPE, postId });
    console.log(`Publishing ${EVENT_TYPE} to Report Topic`);
    return this._publishToDecisionTopicARN(JSON.stringify(snsMessage), postId as string);
  }
}

export {
  SNSService
};