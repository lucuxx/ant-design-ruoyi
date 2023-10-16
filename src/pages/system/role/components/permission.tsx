import React, { useEffect, useState } from 'react';
import { ProForm, ProFormText, DrawerForm, ProFormSelect } from '@ant-design/pro-components';
import { Form, Row, Col, Tree } from 'antd';
import { useIntl, FormattedMessage } from 'umi';
import type { RoleType } from '../data.d';
import type { DataNode } from 'antd/lib/tree';

export type RoleFormValueType = Record<string, unknown> & Partial<RoleType>;

export type RolePermissionFormProps = {
  onCancel: (flag?: boolean, formVals?: RoleFormValueType) => void;
  onSubmit: (values: RoleFormValueType) => Promise<void>;
  visible: boolean;
  values: Partial<RoleType>;
  deptTree: DataNode[];
  deptCheckedKeys: string[];
};

const dataScopeOptions = new Map([
  ['1', '全部数据权限'],
  ['2', '自定义数据权限'],
  ['3', '本机构数据权限'],
  ['4', '本机构及以下数据权限'],
  ['5', '仅本人数据权限'],
]);

const RolePermissionForm: React.FC<RolePermissionFormProps> = (props) => {
  const [form] = Form.useForm();

  const { deptTree, deptCheckedKeys } = props;

  const [dataScope, setDataScope] = useState<any>('1');
  const [deptIds, setDeptIds] = useState<any>();

  useEffect(() => {
    setDataScope(props.values.dataScope);
    form.resetFields();
    form.setFieldsValue({
      roleId: props.values.roleId,
      roleName: props.values.roleName,
      roleKey: props.values.roleKey,
      dataScope: props.values.dataScope,
      deptIds: props.values.deptIds,
    });
  }, [form, props]);

  const intl = useIntl();
  const handleClose = () => {
    props.onCancel();
    form.resetFields();
  };
  const handleFinish = async (values: Record<string, any>) => {
    props.onSubmit({ ...values, deptIds } as RoleFormValueType);
  };

  return (
    <DrawerForm
      form={form}
      title="分配数据权限"
      onFinish={handleFinish}
      initialValues={props.values}
      visible={props.visible}
      drawerProps={{
        destroyOnClose: true,
        onClose: handleClose,
        maskClosable: false,
        keyboard: false,
      }}
    >
      <Row gutter={[16, 16]}>
        <Col span={24} order={1}>
          <ProFormText name="roleId" width="xl" disabled hidden />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24} order={1}>
          <ProFormText
            name="roleName"
            label={intl.formatMessage({
              id: 'system.Role.role_name',
              defaultMessage: '角色名称',
            })}
            width="xl"
            disabled
            placeholder="请输入角色名称"
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24} order={1}>
          <ProFormText
            name="roleKey"
            label={intl.formatMessage({
              id: 'system.Role.role_key',
              defaultMessage: '角色权限字符串',
            })}
            width="xl"
            disabled
            placeholder="请输入角色权限字符串"
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24} order={1}>
          <ProFormSelect
            valueEnum={dataScopeOptions}
            name="dataScope"
            label="权限范围"
            width="xl"
            rules={[
              {
                required: true,
                message: <FormattedMessage id="请选择" defaultMessage="请选择！" />,
              },
            ]}
            fieldProps={{
              onChange: (value) => {
                console.log(value, 'val');
                setDataScope(value);
              },
            }}
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24} order={1}>
          <ProForm.Item
            // width="xl"
            hidden={dataScope != '2'}
            name="deptIds"
            label="数据权限"
          >
            <Tree
              checkable={true}
              multiple={true}
              checkStrictly={false}
              defaultExpandAll={true}
              treeData={deptTree}
              defaultCheckedKeys={deptCheckedKeys}
              onCheck={(keys: any) => {
                setDeptIds(keys);
              }}
            />
          </ProForm.Item>
        </Col>
      </Row>
    </DrawerForm>
  );
};

export default RolePermissionForm;
