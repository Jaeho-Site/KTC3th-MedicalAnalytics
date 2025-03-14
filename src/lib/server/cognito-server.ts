import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute, ISignUpResult } from 'amazon-cognito-identity-js';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

// 안전한 로깅을 위한 유틸리티 함수
const safeLogError = (message: string, error?: Error | unknown) => {
  // 프로덕션 환경에서는 최소한의 오류 정보만 로깅
  if (process.env.NODE_ENV === 'production') {
    console.error(message);
    return;
  }
  
  // 개발 환경에서는 더 자세한 정보 로깅
  console.error(message, error);
};

// 서버 측에서만 사용되는 환경 변수
const poolData = {
  UserPoolId: process.env.COGNITO_USER_POOL_ID!,
  ClientId: process.env.COGNITO_CLIENT_ID!
};

// 서버 측에서만 사용되는 Cognito 사용자 풀
const userPool = new CognitoUserPool(poolData);

// JWT 검증기 설정 - 서버 측에서 공통으로 사용할 검증기
export const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  clientId: process.env.COGNITO_CLIENT_ID!,
  tokenUse: 'id',
});

// JWT 토큰 검증 함수 - 미들웨어와 API 라우트에서 공통으로 사용
export async function verifyToken(token: string) {
  try {
    // Cognito의 JWKS를 사용하여 토큰 검증
    const payload = await verifier.verify(token);
    return { valid: true, payload };
  } catch (error) {
    safeLogError('Token verification failed', error);
    return { valid: false, error };
  }
}

// Cognito 세션 타입 정의
interface CognitoSession {
  isValid(): boolean;
  getIdToken(): {
    getJwtToken(): string;
  };
  getAccessToken(): {
    getJwtToken(): string;
  };
  getRefreshToken(): {
    getToken(): string;
  };
}

// Cognito 인증 결과 타입 정의
interface CognitoAuthResult {
  getIdToken(): {
    getJwtToken(): string;
  };
  getAccessToken(): {
    getJwtToken(): string;
  };
  getRefreshToken(): {
    getToken(): string;
  };
}

// 비밀번호 재설정 응답 타입
interface ForgotPasswordResult {
  CodeDeliveryDetails: {
    AttributeName: string;
    DeliveryMedium: string;
    Destination: string;
  };
}

// 서버 측 Cognito 서비스
export const cognitoServerService = {
  // 회원가입
  signUp: (email: string, password: string): Promise<ISignUpResult> => {
    return new Promise((resolve, reject) => {
      try {
        const attributeList = [];
        
        const emailAttribute = new CognitoUserAttribute({
          Name: 'email',
          Value: email
        });
        
        attributeList.push(emailAttribute);

        userPool.signUp(
          email,
          password,
          attributeList,
          [],
          (err: Error | undefined, result?: ISignUpResult) => {
            if (err) {
              // 프로덕션 환경에서는 민감한 정보 로깅 제한
              if (process.env.NODE_ENV === 'development') {
                console.error('SignUp Error:', {
                  code: (err as any).code,
                  message: err.message,
                  name: err.name
                });
              } else {
                console.error('SignUp Error:', (err as any).code || err.name);
              }
              reject(err);
              return;
            }
            if (result) {
              resolve(result);
            }
          }
        );
      } catch (err) {
        safeLogError('SignUp Exception', err);
        reject(err);
      }
    });
  },

  // 로그인
  signIn: (email: string, password: string): Promise<CognitoAuthResult> => {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          resolve(result);
        },
        onFailure: (err) => {
          safeLogError('Authentication failed', err);
          reject(err);
        }
      });
    });
  },

  // 비밀번호 재설정 요청
  forgotPassword: (email: string): Promise<ForgotPasswordResult> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.forgotPassword({
        onSuccess: (data) => {
          resolve(data);
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  },

  // 비밀번호 재설정 확인
  confirmPassword: (email: string, code: string, newPassword: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          resolve('SUCCESS');
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  },

  // 이메일 인증 확인
  confirmSignUp: (email: string, code: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          safeLogError('Confirmation Error', err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }
}; 