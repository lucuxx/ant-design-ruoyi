import Footer from '@/components/Footer';
import { login } from '@/services/ant-design-pro/api';
import { getFakeCaptcha, getCaptcha } from '@/services/ant-design-pro/login';
import {
  AlipayCircleOutlined,
  LockOutlined,
  MobileOutlined,
  SafetyCertificateOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { Alert, message, Tabs, Input, Row, Col } from 'antd';
import React, { useState, useEffect } from 'react';
import { FormattedMessage, history, SelectLang, useIntl, useModel, Link } from 'umi';
import styles from './index.less';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('account');
  const { initialState, setInitialState } = useModel('@@initialState');

  // 响应的 UUID
  const [captchaKey, setCaptchaKey] = useState<string>('');
  // 响应的图片内容, base64 格式
  const [imageData, setImageData] = useState<string>('');

  /** 刷新验证码图片 */
  const refreshCaptchaImage = async () => {
    getCaptcha().then((data: API.Captcha) => {
      if (data) {
        setCaptchaKey(data.uuid);
        setImageData(data.img);
      }
    });
  };

  useEffect(() => {
    refreshCaptchaImage();
  }, []);

  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      await setInitialState((s) => ({
        ...s,
        currentUser: userInfo,
      }));
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      // 登录
      values.uuid = captchaKey;
      const msg = await login({ ...values, type });
      if (msg.code === 200) {
        // 存储 token
        localStorage.setItem('token', msg.token || '');

        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);
        await fetchUserInfo();
        /** 此方法会跳转到 redirect 参数所在的位置 */
        if (!history) return;
        const { query } = history.location;
        const { redirect } = query as { redirect: string };
        history.push(redirect || '/');
        return;
      }
      console.log(msg);
      // 如果失败去设置用户错误信息
      setUserLoginState(msg);
      refreshCaptchaImage();
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      message.error(defaultLoginFailureMessage);
    }
  };
  // const { status, type: loginType } = userLoginState;

  return (
    <div className={styles.container}>
      <Row className={styles.content}>
        <Col md={14} className={styles.leftSide} />
        <Col md={10} className={styles.rightSide}>
          <div className={styles.form}>
            {/* <div className={styles.top}>
              <div className={styles.header}>
                <Link to="/">
                  <span className={styles.title}>Sky Club</span>
                </Link>
              </div>
              <div className={styles.desc}>{'基于 RuoYi-Vue 提供服务实现 React 前端 UI'}</div>
            </div> */}

            <div className={styles.main}>
              <LoginForm
                logo={<img alt="logo" src="/logo.svg" />}
                title="Sky Club"
                subTitle={intl.formatMessage({ id: 'pages.layouts.userLayout.title' })}
                initialValues={{
                  autoLogin: true,
                }}
                // actions={[
                //   <FormattedMessage
                //     key="loginWith"
                //     id="pages.login.loginWith"
                //     defaultMessage="其他登录方式"
                //   />,
                //   <AlipayCircleOutlined key="AlipayCircleOutlined" className={styles.icon} />,
                //   <TaobaoCircleOutlined key="TaobaoCircleOutlined" className={styles.icon} />,
                //   <WeiboCircleOutlined key="WeiboCircleOutlined" className={styles.icon} />,
                // ]}
                onFinish={async (values) => {
                  await handleSubmit(values as API.LoginParams);
                }}
              >
                <Tabs activeKey={type} onChange={setType}>
                  <Tabs.TabPane
                    key="account"
                    tab={intl.formatMessage({
                      id: 'pages.login.accountLogin.tab',
                      defaultMessage: '账户密码登录',
                    })}
                  />
                  <Tabs.TabPane
                    key="mobile"
                    tab={intl.formatMessage({
                      id: 'pages.login.phoneLogin.tab',
                      defaultMessage: '手机号登录',
                    })}
                  />
                </Tabs>

                {userLoginState.code === 500 && type === 'account' && (
                  <LoginMessage
                    content={intl.formatMessage({
                      id: 'pages.login.accountLogin.errorMessage',
                      defaultMessage: '账户或密码错误',
                    })}
                  />
                )}
                {type === 'account' && (
                  <>
                    <ProFormText
                      name="username"
                      fieldProps={{
                        size: 'middle',
                        prefix: <UserOutlined className={styles.prefixIcon} />,
                      }}
                      placeholder={intl.formatMessage({
                        id: 'pages.login.username.placeholder',
                        defaultMessage: '用户名: admin or user',
                      })}
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage
                              id="pages.login.username.required"
                              defaultMessage="请输入用户名!"
                            />
                          ),
                        },
                      ]}
                    />
                    <ProFormText.Password
                      name="password"
                      fieldProps={{
                        size: 'middle',
                        prefix: <LockOutlined className={styles.prefixIcon} />,
                      }}
                      placeholder={intl.formatMessage({
                        id: 'pages.login.password.placeholder',
                        defaultMessage: '密码: ant.design',
                      })}
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage
                              id="pages.login.password.required"
                              defaultMessage="请输入密码！"
                            />
                          ),
                        },
                      ]}
                    />
                    <Input.Group compact>
                      <ProFormText
                        name="code"
                        fieldProps={{
                          size: 'middle',
                          prefix: <SafetyCertificateOutlined className={styles.prefixIcon} />,
                        }}
                        placeholder={'验证码'}
                        style={{
                          verticalAlign: 'middle',
                          width: '20%',
                        }}
                        rules={[
                          {
                            pattern: /^\d+$/,
                            message: '请输入正确的验证码',
                          },
                        ]}
                      />
                      <img
                        style={{
                          height: '32px',
                          verticalAlign: 'middle',
                          cursor: 'pointer',
                          float: 'right',
                        }}
                        src={'data:image/gif;base64,' + imageData}
                        onClick={refreshCaptchaImage}
                      />
                    </Input.Group>
                  </>
                )}

                {status === 'error' && type === 'mobile' && <LoginMessage content="验证码错误" />}
                {type === 'mobile' && (
                  <>
                    <ProFormText
                      fieldProps={{
                        size: 'middle',
                        prefix: <MobileOutlined className={styles.prefixIcon} />,
                      }}
                      name="mobile"
                      placeholder={intl.formatMessage({
                        id: 'pages.login.phoneNumber.placeholder',
                        defaultMessage: '手机号',
                      })}
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage
                              id="pages.login.phoneNumber.required"
                              defaultMessage="请输入手机号！"
                            />
                          ),
                        },
                        {
                          pattern: /^1\d{10}$/,
                          message: (
                            <FormattedMessage
                              id="pages.login.phoneNumber.invalid"
                              defaultMessage="手机号格式错误！"
                            />
                          ),
                        },
                      ]}
                    />
                    <ProFormCaptcha
                      fieldProps={{
                        size: 'middle',
                        prefix: <LockOutlined className={styles.prefixIcon} />,
                      }}
                      captchaProps={{
                        size: 'middle',
                      }}
                      placeholder={intl.formatMessage({
                        id: 'pages.login.captcha.placeholder',
                        defaultMessage: '请输入验证码',
                      })}
                      captchaTextRender={(timing, count) => {
                        if (timing) {
                          return `${count} ${intl.formatMessage({
                            id: 'pages.getCaptchaSecondText',
                            defaultMessage: '获取验证码',
                          })}`;
                        }
                        return intl.formatMessage({
                          id: 'pages.login.phoneLogin.getVerificationCode',
                          defaultMessage: '获取验证码',
                        });
                      }}
                      name="captcha"
                      rules={[
                        {
                          required: true,
                          message: (
                            <FormattedMessage
                              id="pages.login.captcha.required"
                              defaultMessage="请输入验证码！"
                            />
                          ),
                        },
                      ]}
                      onGetCaptcha={async (phone) => {
                        const result = await getFakeCaptcha({
                          phone,
                        });
                        if (result === false) {
                          return;
                        }
                        message.success('获取验证码成功！');
                      }}
                    />
                  </>
                )}
                <div
                  style={{
                    marginBottom: 24,
                  }}
                >
                  <ProFormCheckbox noStyle name="autoLogin">
                    <FormattedMessage id="pages.login.rememberMe" defaultMessage="自动登录" />
                  </ProFormCheckbox>
                  <a
                    style={{
                      float: 'right',
                    }}
                  >
                    <FormattedMessage id="pages.login.forgotPassword" defaultMessage="忘记密码" />
                  </a>
                </div>
              </LoginForm>
              <Footer />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
