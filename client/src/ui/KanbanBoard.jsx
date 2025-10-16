import React from 'react';
import { Container, Row, Col, Card, Button, Modal, Form } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useStore } from '../zustand/store.js';
import { createTask, updateTask, deleteTask, reorderTasks } from '../utils/api.js';

const COLUMNS = [
	{ key: 'todo', label: 'To Do' },
	{ key: 'inprogress', label: 'In Progress' },
	{ key: 'done', label: 'Done' },
];

export function KanbanBoard() {
	const { tasks, selectedProjectId, setTasks } = useStore();
    const [confirmDelete, setConfirmDelete] = React.useState({ show: false, taskId: null, title: '' });
    const [showCreate, setShowCreate] = React.useState(false);
    const [createForm, setCreateForm] = React.useState({ title: '', description: '' });
    const [createError, setCreateError] = React.useState('');
    const [showEdit, setShowEdit] = React.useState(false);
    const [editTaskId, setEditTaskId] = React.useState(null);
    const [editForm, setEditForm] = React.useState({ title: '', description: '' });

	const tasksByColumn = COLUMNS.reduce((acc, col) => {
		acc[col.key] = tasks.filter(t => t.status === col.key).sort((a,b) => a.position - b.position);
		return acc;
	}, {});

	async function handleDragEnd(result) {
		const { destination, source, draggableId } = result;
		if (!destination) return;
		const fromStatus = source.droppableId;
		const toStatus = destination.droppableId;
		if (!selectedProjectId) return;

		const newColumns = { ...tasksByColumn };
		const sourceTasks = Array.from(newColumns[fromStatus]);
		const [moved] = sourceTasks.splice(source.index, 1);
		const destTasks = fromStatus === toStatus ? sourceTasks : Array.from(newColumns[toStatus]);
		destTasks.splice(destination.index, 0, { ...moved, status: toStatus });
		newColumns[fromStatus] = fromStatus === toStatus ? destTasks : sourceTasks;
		newColumns[toStatus] = destTasks;
		const merged = COLUMNS.flatMap(c => newColumns[c.key].map((t, idx) => ({ ...t, position: idx })));
		setTasks(merged);

		const orderedIds = newColumns[toStatus].map(t => t._id);
		await reorderTasks({ projectId: selectedProjectId, fromStatus, toStatus, orderedIds });
	}

	return (
        <div className="board">
            <div className="toolbar mb-3">
                <Button
                    variant="primary"
					disabled={!selectedProjectId}
                    onClick={() => setShowCreate(true)}
				>
                    + Add Task
                </Button>
			</div>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Container fluid>
                    <Row xs={1} md={3} className="g-3">
                        {COLUMNS.map((col) => (
                            <Col key={col.key}>
                                <h3>
                                    {col.label}
                                    <span style={{ marginLeft: 8, color: '#888', fontWeight: 'normal' }}>
                                        ({tasksByColumn[col.key].length})
                                    </span>
                                </h3>
                                <Droppable droppableId={col.key}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps}>
                                            {tasksByColumn[col.key].map((task, index) => (
                                                <Draggable draggableId={task._id} index={index} key={task._id}>
                                                    {(prov) => (
                                                        <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                                                            <Card className="mb-2">
                                                                <Card.Body>
                                                                    <Card.Title as="div" style={{ fontWeight: 600 }}>
                                                                        {task.title}
                                                                    </Card.Title>
                                                                    <Card.Text style={{ color: '#555' }}>
                                                                        {(task.description || '').length > 140
                                                                            ? `${task.description.slice(0, 140)}\u2026`
                                                                            : (task.description || '')}
                                                                    </Card.Text>
                                                                    <div className="meta" style={{ marginTop: 6, fontSize: 12, color: '#888' }}>
                                                                        Created {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '-'}
                                                                    </div>
                                                                    <div className="card-actions" style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline-secondary"
                                                                            onClick={() => {
                                                                                setEditTaskId(task._id);
                                                                                setEditForm({ title: task.title, description: task.description || '' });
                                                                                setShowEdit(true);
                                                                            }}
                                                                        >
                                                                            Edit
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline-danger"
                                                                            onClick={() => setConfirmDelete({ show: true, taskId: task._id, title: task.title })}
                                                                        >
                                                                            Delete
                                                                        </Button>
                                                                    </div>
                                                                </Card.Body>
                                                            </Card>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </DragDropContext>
            <Modal
                show={confirmDelete.show}
                onHide={() => setConfirmDelete({ show: false, taskId: null, title: '' })}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Delete Task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete "{confirmDelete.title}"?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setConfirmDelete({ show: false, taskId: null, title: '' })}>Cancel</Button>
                    <Button
                        variant="danger"
                        onClick={async () => {
                            if (confirmDelete.taskId) {
                                await deleteTask(confirmDelete.taskId);
                                setTasks(tasks.filter(t => t._id !== confirmDelete.taskId));
                            }
                            setConfirmDelete({ show: false, taskId: null, title: '' });
                        }}
                    >
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add Task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                value={createForm.title}
                                onChange={(e) => {
                                    setCreateForm({ ...createForm, title: e.target.value });
                                    if (createError) setCreateError('');
                                }}
                                placeholder="Enter task title"
                                isInvalid={!!createError}
                            />
                            <Form.Control.Feedback type="invalid">{createError}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={createForm.description}
                                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                placeholder="Enter task description (optional)"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
                    <Button
                        variant="primary"
                        onClick={async () => {
                            const title = createForm.title.trim();
                            if (!title) {
                                setCreateError('Title is required');
                                return;
                            }
                            if (!selectedProjectId) return;
                            const created = await createTask({ projectId: selectedProjectId, title, description: createForm.description, status: 'todo' });
                            setTasks([...tasks, created]);
                            setShowCreate(false);
                            setCreateForm({ title: '', description: '' });
                            setCreateError('');
                        }}
                    >
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Task</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                placeholder="Enter task title"
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                placeholder="Enter task description"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
                    <Button
                        variant="primary"
                        onClick={async () => {
                            if (!editTaskId) return;
                            const task = tasks.find(t => t._id === editTaskId);
                            if (!task) return;
                            const nextTitle = (editForm.title || '').trim();
                            if (!nextTitle) return; // require title
                            const updated = await updateTask(editTaskId, {
                                title: nextTitle,
                                description: editForm.description || '',
                                status: task.status,
                                position: task.position,
                            });
                            setTasks(tasks.map(t => (t._id === editTaskId ? updated : t)));
                            setShowEdit(false);
                            setEditTaskId(null);
                            setEditForm({ title: '', description: '' });
                        }}
                    >
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
		</div>
	);
}


