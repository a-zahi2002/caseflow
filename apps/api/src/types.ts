import type { JwtPayload } from '@caseflow/types'

export type AppEnv = {
  Variables: {
    jwtPayload: JwtPayload
  }
}
