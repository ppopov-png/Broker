import { describe, expect, it } from 'vitest'
import {
  API_V1_CONTRACT,
  API_V1_OPERATIONS,
  API_V1_VERSION,
  type ApiV1Command,
  type ApiV1Query,
  type ApiV1Request,
  type ApiV1Response,
  type ApiV1Version,
  type EddResponse,
  type KycSession,
  type OnboardingStatus,
  type SubmittedDocument,
} from '@trigonum/api'

describe('@trigonum/api v1 public contract', () => {
  it('publishes versioned operation metadata without prototype-only commands', () => {
    expect(API_V1_VERSION satisfies ApiV1Version).toBe('v1')
    expect(API_V1_CONTRACT.operations).toBe(API_V1_OPERATIONS)
    expect(API_V1_OPERATIONS.getOnboardingState).toEqual({
      id: 'onboarding.getState',
      kind: 'query',
    })
    expect(API_V1_OPERATIONS.submitDocuments).toEqual({
      id: 'onboarding.documents.submit',
      kind: 'command',
    })
    expect(Object.keys(API_V1_OPERATIONS)).not.toEqual(
      expect.arrayContaining([
        'resetOnboarding',
        'setOnboardingState',
        'startIdentitySimulation',
        'completeKycNow',
      ]),
    )
  })
})

// This file is also compiled by tsconfig.tests.json. The function is never
// called at runtime; it checks adapter usage without inventing HTTP routes.
function assertContractTypes(query: ApiV1Query, command: ApiV1Command) {
  const statusResult: Promise<OnboardingStatus> = query('onboarding.getState')
  const sessionResult: Promise<KycSession> = query('onboarding.kyc.getSession', { sessionId: 'kyc-1' })
  const attachmentResult: Promise<SubmittedDocument> = command('onboarding.documents.attach', {
    documentId: 'passport',
    fileName: 'passport.pdf',
  })
  const emptyResult: Promise<void> = command('onboarding.agreements.finalize')

  const eddPayload: ApiV1Request<'onboarding.edd.submitResponse'> = { answers: [] }
  const eddResult: Promise<ApiV1Response<'onboarding.edd.submitResponse'>> = command(
    'onboarding.edd.submitResponse',
    eddPayload,
  )
  const typedEddResult: Promise<EddResponse> = eddResult

  // @ts-expect-error unknown operation identifier
  query('onboarding.unknown')
  // @ts-expect-error a query cannot be executed through the command adapter
  command('onboarding.getState')
  // @ts-expect-error a command cannot be executed through the query adapter
  query('onboarding.documents.remove', { documentId: 'passport' })
  // @ts-expect-error required request DTO is missing
  query('onboarding.kyc.getSession')
  // @ts-expect-error payload is checked from the selected operation, not inferred independently
  command('onboarding.documents.attach', { documentId: 'passport' })
  // @ts-expect-error an operation with void input rejects an invented payload
  command('onboarding.agreements.finalize', {})
  // @ts-expect-error the response DTO is fixed by the operation declaration
  const wrongResult: Promise<KycSession> = query('onboarding.getState')

  void [statusResult, sessionResult, attachmentResult, emptyResult, typedEddResult, wrongResult]
}

void assertContractTypes
