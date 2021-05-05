import { Button, Table, Modal, Form, Input, Select } from "antd";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Task, DeleteTaskPayload, CreateTaskPayload, Status, useDeleteTaskMutation, useTasksQuery, useUpdateTaskMutation, useCreateTaskMutation, TasksDocument } from "@app/graphql";
import { TaskList } from '@app/components';
import { NextPage } from "next";


const STATUSES = Object.keys(Status)

// using any to be agnostic when transforming the fields
const transformFields = (fields: any[]) => (
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
    value: Status.ToDo
  }
]

const Home: NextPage = () => {
  const formRef = useRef()
  const [isModalOpen, setIsModalOpen] = useState(false)
  // use an update function to manipulate cache to update TaskList
  // instead of re-doing the fetch query to get resulting data
  const update = ( cache: any, { data }: DeleteTaskPayload | CreateTaskPayload) => {
    const deleteTask = data?.deleteTask
    const cachedTasks = cache.readQuery({ query: TasksDocument })
    const updatedTaskList = deleteTask
      ? cachedTasks.tasks.nodes.filter((node: Task) => node.id !== deleteTask?.task?.id)
      : [ ...cachedTasks.tasks.nodes, data?.createTask.task ]
    if (cachedTasks && updatedTaskList) {
      cache.writeQuery({
        query: TasksDocument,
        data: {
          tasks: {
            nodes: updatedTaskList,
            __typename: "TasksConnection"
          }
        }
      })
    }

  }
  const [createTask] = useCreateTaskMutation()
  const [updateTask] = useUpdateTaskMutation()
  const [deleteTask] = useDeleteTaskMutation()
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

  const handleChange = (_, allFields: any) => setFields(allFields)

  return (
    <>
      <TaskList updateTask={updateTask} deleteTask={deleteTask} update={update} />
      <Button type="primary" onClick={setIsModalOpen}>Create Task</Button>
      <Modal visible={isModalOpen} onCancel={handleCancel} onOk={handleOk}>
        <Form ref={formRef} onFieldsChange={handleChange} fields={[fields]}>
          <Form.Item label="Title" name="title"><Input /></Form.Item>
          <Form.Item label="Description" name="description"><Input /></Form.Item>
          <Form.Item label="Status" name="status">
            <Select placeholder="Set the status of your task" allowClear>
              {STATUSES.map(status => <Select.Option key={status} value={Status[status]}>{status}</Select.Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Home;
