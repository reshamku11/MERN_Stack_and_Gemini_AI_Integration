import React, { useState } from 'react';
import { useStore } from '../zustand/store.js';
import { createProject, updateProject, deleteProject } from '../utils/api.js';
import { Button, Table, Form, Row, Col, Stack, Modal } from 'react-bootstrap';

export function ProjectsManager({ onOpen }) {
    const { projects, setProjects, selectedProjectId, setSelectedProjectId } = useStore();
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });
    const [confirmDelete, setConfirmDelete] = useState({ show: false, projectId: null, name: '' });
    const [formError, setFormError] = useState('');

    function startCreate() {
        setEditingId('new');
        setForm({ name: '', description: '' });
        setFormError('');
    }

    function startEdit(project) {
        setEditingId(project._id);
        setForm({ name: project.name, description: project.description || '' });
        setFormError('');
    }

    function cancelEdit() {
        setEditingId(null);
        setForm({ name: '', description: '' });
        setFormError('');
    }

    async function submit() {
        if (!form.name.trim()) {
            setFormError('Name is required');
            return;
        }
        if (editingId === 'new') {
            const created = await createProject({ name: form.name.trim(), description: form.description });
            const nextProjects = [created, ...projects];
            setProjects(nextProjects);
            setSelectedProjectId(created._id);
        } else if (editingId) {
            const updated = await updateProject(editingId, { name: form.name.trim(), description: form.description });
            const nextProjects = projects.map(p => (p._id === editingId ? updated : p));
            setProjects(nextProjects);
        }
        cancelEdit();
    }

    async function handleDelete(id) {
        await deleteProject(id);
        const nextProjects = projects.filter(p => p._id !== id);
        setProjects(nextProjects);
        if (selectedProjectId === id) {
            setSelectedProjectId(nextProjects[0]?._id || null);
        }
    }

    return (
        <div className="projects-manager">
            <Stack direction="horizontal" gap={2} className="mb-3">
                <h2 className="mb-0">Projects</h2>
                <div className="ms-auto">
                    <Button onClick={startCreate}>+ New Project</Button>
                </div>
            </Stack>
            <Modal show={!!editingId} onHide={cancelEdit} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingId === 'new' ? 'New Project' : 'Edit Project'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                placeholder="Name"
                                value={form.name}
                                onChange={(e) => {
                                    setForm({ ...form, name: e.target.value });
                                    if (formError) setFormError('');
                                }}
                                isInvalid={!!formError}
                            />
                            <Form.Control.Feedback type="invalid">{formError}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                placeholder="Description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={cancelEdit} variant="outline-secondary">Cancel</Button>
                    <Button onClick={submit} variant="primary">{editingId === 'new' ? 'Create' : 'Save'}</Button>
                </Modal.Footer>
            </Modal>
            <Table hover responsive>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map((p) => (
                        <tr key={p._id} style={{ background: selectedProjectId === p._id ? '#f8f9fa' : 'transparent' }}>
                            <td>{p.name}</td>
                            <td>{p.description}</td>
                            <td>{p.createdAt ? new Date(p.createdAt).toLocaleString() : '-'}</td>
                            <td>
                                <Stack direction="horizontal" gap={2}>
                                    <Button
                                        size="sm"
                                        variant="outline-primary"
                                        onClick={() => {
                                            setSelectedProjectId(p._id);
                                            if (onOpen) onOpen();
                                        }}
                                    >
                                        Open
                                    </Button>
                                    <Button size="sm" variant="outline-secondary" onClick={() => startEdit(p)}>Edit</Button>
                                    <Button
                                        size="sm"
                                        variant="outline-danger"
                                        onClick={() => setConfirmDelete({ show: true, projectId: p._id, name: p.name })}
                                    >
                                        Delete
                                    </Button>
                                </Stack>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Modal
                show={confirmDelete.show}
                onHide={() => setConfirmDelete({ show: false, projectId: null, name: '' })}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Delete Project</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete "{confirmDelete.name}"? This will also delete all its tasks.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setConfirmDelete({ show: false, projectId: null, name: '' })}>Cancel</Button>
                    <Button
                        variant="danger"
                        onClick={async () => {
                            if (confirmDelete.projectId) {
                                await handleDelete(confirmDelete.projectId);
                            }
                            setConfirmDelete({ show: false, projectId: null, name: '' });
                        }}
                    >
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}


