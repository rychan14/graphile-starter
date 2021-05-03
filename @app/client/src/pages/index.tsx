import { Button, Table, Modal, Form, Input, Select } from "antd";
import React, { useRef, useState } from "react";
import { useTasksQuery, useCreateTaskMutation, TasksDocument } from "@app/graphql";
import { NextPage } from "next";


const TaskList = () => {
  const { data, loading, error } = useTasksQuery();
  const taskData = loading ? [] : data?.tasks.nodes
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
    },

    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
    },
  ]
  return (
    <Table
      columns={columns}
      dataSource={taskData}
      pagination={false}
      rowKey="id"
    />
  )
}

interface FieldData {
  title: string;
  description: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE'
}

const transformFields = (fields) => (
  fields.reduce((accum, field) => ({
    ...accum,
    [field.name?.[0]]: field.value
  }), {})
)

const initialState = [
  {
    name: 'title',
    value: "",
  },
  {
    name: 'description',
    value: "",
  },
  {
    status: 'status',
    value: null
  }
]

const Home: NextPage = () => {
  const formRef = useRef()
  const [isModalOpen, setIsModalOpen] = useState(false)
  // use an update function to manipulate cache to update TaskList
  // instead of re-doing the fetch query to get resulting data
  const update = ( cache, { data }) => {
    const newTask = data?.createTask.task
    const cachedTasks = cache.readQuery({ query: TasksDocument })
    const newTaskList = [ ...cachedTasks.tasks.nodes, newTask ]
    if (newTask && cachedTasks) {
      cache.writeQuery({
        query: TasksDocument,
        data: {
          tasks: {
            nodes: newTaskList,
            __typename: "TasksConnection"
          }
        }
      })
    }

  }
  const [createTask] = useCreateTaskMutation()
  const [fields, setFields] = useState(initialState)
  const handleCancel = () => setIsModalOpen(false)
  const handleOk = async () => {
    // TODO: sanitize inputs, for now it is just acting as a transform layer
    const transformedFields = transformFields(fields)
    try {
      await createTask({ variables: transformedFields, update })
      setIsModalOpen(false)
      formRef.current.resetFields()
    } catch (e) {
      console.error(e)
    }
  }

  const handleChange = (_, allFields) => setFields(allFields)

  return (
    <>
      <TaskList />
      <Button type="primary" onClick={setIsModalOpen}>Create Task</Button>
      <Modal visible={isModalOpen} onCancel={handleCancel} onOk={handleOk}>
        <Form ref={formRef} onFieldsChange={handleChange} fields={[fields]}>
          <Form.Item label="Title" name="title"><Input /></Form.Item>
          <Form.Item label="Description" name="description"><Input /></Form.Item>
          <Form.Item label="Status" name="status">
            <Select placeholder="Set the status of your task" allowClear>
              <Select.Option value="TO_DO">To Do</Select.Option>
              <Select.Option value="IN_PROGRESS">In Progress</Select.Option>
              <Select.Option value="DONE">Done</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Home;
