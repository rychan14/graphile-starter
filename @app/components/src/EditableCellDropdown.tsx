import { Status } from "@app/graphql";
import { Form, Select } from "antd";
import React from "react";

const STATUSES = Object.keys(Status);

const EditableCellDropdown = ({
  dataIndex,
  dropdownProps,
}: {
  dataIndex: string;
  dropdownProps: {
    onSelect: () => void;
  };
}) => {
  return (
    <Form.Item key={dataIndex} name={dataIndex} className="editable-form-item">
      <Select {...dropdownProps} placeholder="Set the status of your task">
        {STATUSES.map((status) => (
          <Select.Option key={status} value={Status[status]}>
            {status}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};

export default EditableCellDropdown;
