import type {
  Agreement,
  AgreementConsentRequest,
  AttachDocumentRequest,
  ConsentLogEntry,
  EddResponse,
  EddTemplate,
  GetKycSessionRequest,
  KycSession,
  MessageThread,
  OnboardingHistoryEntry,
  OnboardingStatus,
  RemoveDocumentRequest,
  SelfCertification,
  SubmitDocumentsRequest,
  SubmitEddResponseRequest,
  SubmittedDocument,
} from './onboarding-dto'

export const API_V1_VERSION = 'v1' as const

export type ApiV1Version = typeof API_V1_VERSION
export type ApiOperationKind = 'query' | 'command'

/** A single declaration tying an operation identifier to its input and output DTOs. */
export interface ApiOperation<
  Id extends string,
  Kind extends ApiOperationKind,
  Request,
  Response,
> {
  readonly id: Id
  readonly kind: Kind
  /** Type-only marker. It is intentionally absent from the runtime catalogue. */
  readonly __types?: {
    readonly request: Request
    readonly response: Response
  }
}

function defineOperation<const Id extends string, const Kind extends ApiOperationKind>(id: Id, kind: Kind) {
  return <Request, Response>(): ApiOperation<Id, Kind, Request, Response> => ({ id, kind })
}

export const API_V1_OPERATIONS = {
  getOnboardingState: defineOperation('onboarding.getState', 'query')<void, OnboardingStatus>(),
  getOnboardingHistory: defineOperation('onboarding.getHistory', 'query')<void, OnboardingHistoryEntry[]>(),
  getKycSession: defineOperation('onboarding.kyc.getSession', 'query')<GetKycSessionRequest, KycSession>(),
  getSelfCertification: defineOperation('onboarding.selfCertification.get', 'query')<void, SelfCertification>(),
  getAgreements: defineOperation('onboarding.agreements.get', 'query')<void, Agreement[]>(),
  getConsentLog: defineOperation('onboarding.agreements.getConsentLog', 'query')<void, ConsentLogEntry[]>(),
  getDocuments: defineOperation('onboarding.documents.get', 'query')<void, Record<string, SubmittedDocument>>(),
  getEddTemplate: defineOperation('onboarding.edd.getTemplate', 'query')<void, EddTemplate>(),
  getEddResponse: defineOperation('onboarding.edd.getResponse', 'query')<void, EddResponse>(),
  getMessageThreads: defineOperation('onboarding.messages.getThreads', 'query')<void, MessageThread[]>(),

  createKycSession: defineOperation('onboarding.kyc.createSession', 'command')<void, KycSession>(),
  submitSelfCertification: defineOperation('onboarding.selfCertification.submit', 'command')<
    SelfCertification,
    SelfCertification
  >(),
  consentAgreement: defineOperation('onboarding.agreements.consent', 'command')<AgreementConsentRequest, void>(),
  revokeAgreement: defineOperation('onboarding.agreements.revoke', 'command')<AgreementConsentRequest, void>(),
  finalizeAgreements: defineOperation('onboarding.agreements.finalize', 'command')<void, void>(),
  attachDocument: defineOperation('onboarding.documents.attach', 'command')<
    AttachDocumentRequest,
    SubmittedDocument
  >(),
  removeDocument: defineOperation('onboarding.documents.remove', 'command')<RemoveDocumentRequest, void>(),
  submitDocuments: defineOperation('onboarding.documents.submit', 'command')<SubmitDocumentsRequest, void>(),
  submitEddResponse: defineOperation('onboarding.edd.submitResponse', 'command')<
    SubmitEddResponseRequest,
    EddResponse
  >(),
} as const

export const API_V1_CONTRACT = {
  version: API_V1_VERSION,
  operations: API_V1_OPERATIONS,
} as const

export type ApiV1Contract = typeof API_V1_CONTRACT
export type ApiV1Operation = ApiV1Contract['operations'][keyof ApiV1Contract['operations']]
export type ApiV1OperationId = ApiV1Operation['id']

type ApiV1OperationById<Id extends ApiV1OperationId> = Extract<ApiV1Operation, { id: Id }>

export type ApiV1Request<Id extends ApiV1OperationId> = NonNullable<
  ApiV1OperationById<Id>['__types']
>['request']

export type ApiV1Response<Id extends ApiV1OperationId> = NonNullable<
  ApiV1OperationById<Id>['__types']
>['response']

export type ApiV1QueryId = Extract<ApiV1Operation, { kind: 'query' }>['id']
export type ApiV1CommandId = Extract<ApiV1Operation, { kind: 'command' }>['id']

type OperationArguments<Request> = [Request] extends [void] ? [] : [request: Request]

/** Signature implemented by adapters that execute read-only v1 operations. */
export type ApiV1Query = <Id extends ApiV1QueryId>(
  id: Id,
  ...args: OperationArguments<ApiV1Request<NoInfer<Id>>>
) => Promise<ApiV1Response<Id>>

/** Signature implemented by adapters that execute state-changing v1 operations. */
export type ApiV1Command = <Id extends ApiV1CommandId>(
  id: Id,
  ...args: OperationArguments<ApiV1Request<NoInfer<Id>>>
) => Promise<ApiV1Response<Id>>
