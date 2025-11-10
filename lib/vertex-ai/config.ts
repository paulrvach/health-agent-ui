export const VERTEX_AI_CONFIG = {
  project: "241564477458",
  endpointId: "8672920232106393600",
  location: "us-central1",
}

export const INITIAL_FEATURES = {
  Player_Age: "28.0",
  Player_Weight: "75.0341475117841",
  Player_Height: "180.03803076123188",
  Previous_Injuries: "1",
  Training_Intensity: "0.4840205725094041",
  Recovery_Time: "2",
}

export type FeatureKey = keyof typeof INITIAL_FEATURES
export type PredictionFeatures = typeof INITIAL_FEATURES

// Service account stored server-side only
export const SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "cutesom",
  private_key_id: "b9ff49dc0eb17b39d02f656bb8f8d6971071a281",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC8PNyDnwc1EHJ0\n4aD+xPw0/8+6RmfZ7xDHVlf3HW8zo1cs09TrY66xKqDm/UoURBlVsPU+bLxResn9\nOul0TXKxvB8TO4jHm2QKxJnR3bDn1gD97A5xGokns1MNJNT7f5mXayfkSXKiELFm\nsXIKeMHq0GlCWDqPbpmJnJ9gcuhu9MMSjPnRd2fy1k+W89KNc53myD/3tD0c0cba\nNjNqJAGLrsQRHhzUb/jhKPP8DQJDWtIgePvtvQP5XlCjF9fBm1ov6x/uDyw18S4I\nR8kalnRUZSEprAuXhad3IKZSY8cgDWeWBCxDkXi03sgJ38BvwafINXzn0CH33BwW\nwneDqmsTAgMBAAECggEADnuQrDAzzqffMbhbk2Gv7xrD4aOU57lTU6e3grCvkEwG\nPLgBnw8fO8wfvBXx0w3x2w9148f1VAy79leuUL+JGwnYl2y45EHdS4MyO7Z9Hweh\ny036ehMRSWfF9IvVNsWe/7DqM7ZY82vDkmo41khrNxGyf4nCDt+mDYBQ6aVKb9R5\n1wupuftVuVnby+gNhe/J9Vvjx84b9TSMS1c3WlNmcWcxoBQNoRjFgfBkbJ6kbee4\n8G7B9XRqigA8FYgA2rExr6ndopLIUwuHyNje2UkUBi3zYzqNv/Fza0Jh2BT6HH9Y\nl+oM7tAwk0myPttoyJGnEzJ5zSZBx1ZFQ+ixW7fcpQKBgQDtNkDJvLubaS0CHSPk\ncPwwQ7SLdtlCy67/4GjMn0BSjmxZ4IzHxABrNGalO0SU97JpxyFP1Vf3Z1ixuR46\nu2vcFeCc80s+UjfvYZh5cxj1HTEFBX1Zn0n5l62TmJ6GRPGzscrOn3JEegUIIvL7\nWD9QbRGWDE1TC/lBMFUQ81jPNwKBgQDLJZmRivWunpHLInGh8iN4KMieXh+ykT5R\n/Ga5QHdPes2E96zmd+QGmCgHNOl0qj2ZeMJoT50tGm70fUVg/5pr4JTbL6rUFN3d\nLZGr6qczBspD6n1j+eiUehipMN3ptF9cIwEvlDGsxn8JSwvrrGWWcirKmjeYcJ+C\nBwTgQ94ZBQKBgQCwMMnyjhKzHm3l0gsk1J8cok1qAX7iVDPJrr9orSizqUHliBpJ\nDtZYynUraVhJZanJU7T0fTx3cPW6HAvOCAPXVxCcw0EyKxOM5GrCWrFA7svINQmk\nFeJ2VykAJi4pAPCeTgKbcmcHYbJ3Fq5v7l4ouLqFPuH4Oz6KIwIsMvPWBQKBgGP9\ns+MhpOA4iMaVw5zU1ISWfnkFF1ELkMNGG0Hf61ohtftW9bHTHVfpmPpDHw4fpYZf\nHEG/vjuvISISbw3ZgibLOjnQ8qLFSpdNkMAwFfBVzUU0rFeDcOl0V6MfvHsGH1H4\noOLMbM8APRNT7yAnkTFGLK3gzrCn7rtPvSSuAyoJAoGBAKuBfr7TrlqExomL/3IB\n+JD25lRNO4Kt8mgHd73lDTbedP3O3C/KI23QPzUh/W00lot/EeirfUmby2wc+pp2\nGcbHoix5zFQnC1YgKq4wgrHdF/E0iTrjt8e+2OAEfm+njCdbbI234/LTAbo52ZMQ\nLXQL1RAHpXGMZvvdt2upJx/X\n-----END PRIVATE KEY-----\n",
  client_email: "vertex-endpoint-prediction-sa@cutesom.iam.gserviceaccount.com",
  client_id: "107831448116681494723",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/vertex-endpoint-prediction-sa%40cutesom.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
}

