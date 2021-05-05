import { Form, Input } from "antd";
import React from "react";

const EditableCellInput = ({
  dataIndex,
  inputProps,
}: {
  dataIndex: string;
  inputProps: {
    onBlur: () => void;
  };
}) => (
  <Form.Item name={dataIndex} className="editable-form-item">
    <Input {...inputProps} />
  </Form.Item>
);

export default EditableCellInput;
