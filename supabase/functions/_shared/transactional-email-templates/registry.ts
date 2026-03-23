/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as esignRequest } from './esign-request.tsx'
import { template as dealEmail } from './deal-email.tsx'
import { template as ccachAuthorization } from './ccach-authorization.tsx'
import { template as supportTicketNotification } from './support-ticket-notification.tsx'
import { template as keywordAlert } from './keyword-alert.tsx'
import { template as dailyDigest } from './daily-digest.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'esign-request': esignRequest,
  'deal-email': dealEmail,
  'ccach-authorization': ccachAuthorization,
  'support-ticket-notification': supportTicketNotification,
  'keyword-alert': keywordAlert,
  'daily-digest': dailyDigest,
}
