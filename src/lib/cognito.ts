import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute, ISignUpResult } from 'amazon-cognito-identity-js';

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

export interface CognitoError extends Error {
  code?: string;
  statusCode?: number;
}

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!
};

export const userPool = new CognitoUserPool(poolData);

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

export const cognitoService = {
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
              console.error('SignUp Error:', {
                code: (err as CognitoError).code,
                message: err.message,
                name: err.name
              });
              reject(err);
              return;
            }
            if (result) {
              resolve(result);
            }
          }
        );
      } catch (err) {
        console.error('SignUp Exception:', err);
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
          // Cognito 세션 자체를 사용 (localStorage 사용 제거)
          window.dispatchEvent(new Event('auth-change'));
          resolve(result);
        },
        onFailure: (err) => {
          console.error('Authentication failed:', err);
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

  getCurrentSession: () => {
    return new Promise<CognitoSession | null>((resolve, reject) => {
      const user = userPool.getCurrentUser();
      if (user) {
        user.getSession((err: Error | null, session: CognitoSession) => {
          if (err) {
            console.error('Session error:', err);
            reject(err);
            return;
          }
          if (session.isValid()) {
            resolve(session);
          } else {
            resolve(null);
          }
        });
      } else {
        resolve(null);
      }
    });
  },

  signOut: () => {
    const user = userPool.getCurrentUser();
    if (user) {
      user.signOut();
      window.dispatchEvent(new Event('auth-change'));
    }
  },

  confirmSignUp: (email: string, code: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          console.error('Confirmation Error:', err);
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }
};