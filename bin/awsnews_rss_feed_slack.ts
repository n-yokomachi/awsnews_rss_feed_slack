#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsnewsRssFeedSlackStack } from '../lib/awsnews_rss_feed_slack-stack';

const app = new cdk.App();
new AwsnewsRssFeedSlackStack(app, 'AwsnewsRssFeedSlackStack', {});