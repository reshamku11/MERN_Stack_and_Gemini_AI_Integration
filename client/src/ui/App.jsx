import React, { useEffect, useState } from 'react';
import { Container, Navbar, Nav, Button, Modal, Form } from 'react-bootstrap';
import { ProjectSelector } from './ProjectSelector.jsx';
import { KanbanBoard } from './KanbanBoard.jsx';
import { ProjectsManager } from './ProjectsManager.jsx';
import { useStore } from '../zustand/store.js';
import { fetchProjects, fetchTasks, summarizeProject, askQuestion } from '../utils/api.js';

export function App() {
    const { selectedProjectId, setProjects, setTasks } = useStore();
    const { tasks } = useStore();
    const [showManager, setShowManager] = useState(false);
    const [modal, setModal] = useState({ show: false, title: '', body: '' });
    const [ask, setAsk] = useState({ show: false, question: '', taskId: '' });

	useEffect(() => {
		(async () => {
			const projects = await fetchProjects();
			setProjects(projects);
		})();
	}, [setProjects]);

	useEffect(() => {
		(async () => {
			if (!selectedProjectId) return;
			const tasks = await fetchTasks(selectedProjectId);
			setTasks(tasks);
		})();
	}, [selectedProjectId, setTasks]);

	return (
        <div className="app">
            <Navbar bg="light" expand="md" className="mb-3">
                <Container fluid>
                    <Navbar.Brand>Project & Task Management (AI)</Navbar.Brand>
                    <Navbar.Toggle aria-controls="main-nav" />
                    <Navbar.Collapse id="main-nav">
                        <Nav className="me-auto" style={{ gap: 8 }}>
                            <ProjectSelector />
                            <Button variant="outline-primary" onClick={() => setShowManager(s => !s)}>
                                {showManager ? 'Close Projects' : 'Manage Projects'}
                            </Button>
                        </Nav>
                        <div className="ai-actions" style={{ display: 'flex', gap: 8 }}>
                            <Button
                                variant="primary"
                                onClick={async () => {
                                    const state = useStore.getState();
                                    if (!state.selectedProjectId) return;
                                    const project = state.projects.find(p => p._id === state.selectedProjectId);
                                    const summary = await summarizeProject(project?.name || 'Project', state.tasks);
                                    setModal({ show: true, title: 'Project Summary', body: summary });
                                }}
                            >
                                Summarize Project
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setAsk({ show: true, question: '', taskId: '' })}
                            >
                                Ask AI
                            </Button>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container fluid>
                {showManager ? <ProjectsManager onOpen={() => setShowManager(false)} /> : <KanbanBoard />}
            </Container>
            <Modal show={modal.show} onHide={() => setModal({ ...modal, show: false })} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{modal.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ whiteSpace: 'pre-wrap' }}>{modal.body}</Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setModal({ ...modal, show: false })}>Close</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={ask.show} onHide={() => setAsk({ show: false, question: '', taskId: '' })} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Ask AI</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Question</Form.Label>
                            <Form.Control
                                value={ask.question}
                                onChange={(e) => setAsk({ ...ask, question: e.target.value })}
                                placeholder="Ask a question about a card (title/desc)"
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Card (optional)</Form.Label>
                            <Form.Select
                                value={ask.taskId}
                                onChange={(e) => setAsk({ ...ask, taskId: e.target.value })}
                            >
                                <option value="">-- No specific card --</option>
                                {tasks.map((t) => (
                                    <option key={t._id} value={t._id}>{t.title}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setAsk({ show: false, question: '', taskId: '' })}>Cancel</Button>
                    <Button
                        variant="primary"
                        onClick={async () => {
                            const q = ask.question.trim();
                            if (!q) return;
                            const card = tasks.find(t => t._id === ask.taskId) || {};
                            const answer = await askQuestion(q, card);
                            setAsk({ show: false, question: '', taskId: '' });
                            setModal({ show: true, title: 'AI Answer', body: answer });
                        }}
                    >
                        Ask
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
	);
}


