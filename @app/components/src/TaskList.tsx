import { Table, Form } from "antd";
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { useTasksQuery, Status, Task, TasksQuery } from "@app/graphql";
import EditableCellDropdown from './EditableCellDropdown';
import EditableCellInput from './EditableCellInput';

type RecordWithOptionalFields = Pick<Task, 'status' | 'title' | 'description'> & Partial<Task>

interface EditableContextProps {
  setFieldsValue: (...args: any[]) => void;
  getFieldsValue: (...args: any[]) => RecordWithOptionalFields;
}
const EditableContext = createContext<EditableContextProps>({
  setFieldsValue() {},
  getFieldsValue: () => ({ status: Status.ToDo,  title: "", description: "" }),
})

const EditableCell = ({
  children,
  dataIndex,
  dropdown,
  editable,
  record,
  updateTask,
}: {
  children: ReactNode,
  dataIndex: string,
  dropdown: boolean,
  editable: boolean,
  record: RecordWithOptionalFields,
  updateTask: (...args: any[]) => void
}) => {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const form = useContext(EditableContext)

  // focus input when the editing is toggled on
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editing])

  const toggleEditingMode = () => {
    // if not in edit mode, set the value of the input to match cache
    if (!editing ) {
      form.setFieldsValue({
        [dataIndex]: record[dataIndex]
      })
    }

    // enable editing
    setEditing(!editing)
  }

  const saveEdits = async () => {
    // save changes, toggle edit off
    setEditing(!editing)
    const { status, title, description } = form.getFieldsValue(true)
    try {
      await updateTask({
        variables: {
          id: record.id,
          patch: { status, title, description },
        },
      });
    } catch (e) {
      console.error(e)
    }
  }

  const inputProps = {
    ref: inputRef,
    onBlur: saveEdits,
  }

  const dropdownProps = {
    ref: inputRef,
    onSelect: saveEdits,
  }

  return (
    <td>
      {dropdown && editable
        ? <EditableCellDropdown dataIndex={dataIndex} dropdownProps={dropdownProps} />
        : !dropdown && editable && editing
          ? <EditableCellInput dataIndex={dataIndex} inputProps={inputProps} />
          : editable && !editing
            ? <span className="editable-input-cell" onClick={toggleEditingMode}>
                {children}
              </span>
            : children
      }
    </td>
  )
}


const EditableRow = ({
  className,
  record,
  ...props
}: {
  className: string,
  record: RecordWithOptionalFields
}) => {
  const [form] = Form.useForm()
  return (
    <Form form={form} component={false} initialValues={record}>
      <EditableContext.Provider value={form}>
        <tr {...props} className={`${className} table-row`} />
      </EditableContext.Provider>
    </Form>
  )
}

const transformColumn = (col: {
  editable?: boolean,
  dropdown?: boolean,
  dataIndex: string,
  title: string,
  updateTask?: () => any
}) => {
  if (!col.editable) {
    return col;
  }

  return {
    ...col,
    onCell: (record: RecordWithOptionalFields) => ({
      record,
      dropdown: col.dropdown,
      editable: col.editable,
      dataIndex: col.dataIndex,
      title: col.title,
      updateTask: col.updateTask,
    }),
  };
}

export const TaskList = ({
  updateTask,
  deleteTask,
  update
}: {
  updateTask: (...args: any[]) => void,
  deleteTask: (...args: any[]) => void,
  update: () => void
}) => {
  const query = useTasksQuery()
  const taskData = !query?.loading && query
    ? query?.data?.tasks?.nodes.map((node: Task)  => {
      const handleDelete = async () => {
        try {
          await deleteTask({ variables: { id: node.id }, update })
        } catch (error) {
          console.error(error)
        }
      }

      return ({
        ...node,
        // add the "Remove action to the row"
        actions: <a onClick={handleDelete}>Remove</a>
      })
    })
    : []

  const columns = [
    {
      dataIndex: 'title',
      editable: true,
      key: 'title',
      title: 'Title',
      updateTask,
      width: '25%',
    },
    {
      dataIndex: 'description',
      editable: true,
      key: 'description',
      title: 'Description',
      updateTask,
      width: '25%',
    },
    {
      dataIndex: 'status',
      editable: true,
      dropdown: true,
      key: 'status',
      title: 'Status',
      updateTask,
      width: '25%',
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      deleteTask,
      key: 'actions',
    }
  ]
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell
    }
  }
  return (
    <>
      <Table
        // use id because Antd type system doesn't allow passing just the record
        // needs to have an attribute that overlaps with HTMLAttributes<HTMLElement> type
        onRow={(record: RecordWithOptionalFields) => ({ record, id: record.id })}
        bordered
        columns={columns.map(transformColumn)}
        components={components}
        dataSource={taskData}
        pagination={false}
        rowKey="id"
      />
    </>
  )
}
