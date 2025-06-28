import React, { useState } from 'react';

const AddProject = () => {
    const [projectName, setProjectName] = useState('');
    const [projectType, setProjectType] = useState('new');
    const [projectFramework, setProjectFramework] = useState('React');
    const [folderPath, setFolderPath] = useState('');
    const [repoLink, setRepoLink] = useState('');

    const handleAddProject = () => {
        // Logic to add the project
        console.log('Project added:', { projectName, projectType, projectFramework, folderPath, repoLink });
    };

    const getButtonText = () => {
        switch (projectType) {
            case 'new':
                return 'Create';
            case 'clone':
                return 'Clone';
            case 'folder':
                return 'Add';
            default:
                return 'Add';
        }
    };

    return (
        <div>
            <h2>Add Project</h2>
            <div>
                <label>
                    <input
                        type="radio"
                        value="new"
                        checked={projectType === 'new'}
                        onChange={() => setProjectType('new')}
                    />
                    New Project
                </label>
                <label>
                    <input
                        type="radio"
                        value="folder"
                        checked={projectType === 'folder'}
                        onChange={() => setProjectType('folder')}
                    />
                    Add Project from Folder
                </label>
                <label>
                    <input
                        type="radio"
                        value="clone"
                        checked={projectType === 'clone'}
                        onChange={() => setProjectType('clone')}
                    />
                    Clone Git Repository
                </label>
            </div>
            {projectType === 'new' && (
                <div>
                    <input
                        type="text"
                        placeholder="Project Name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                    />
                    <select
                        value={projectFramework}
                        onChange={(e) => setProjectFramework(e.target.value)}
                    >
                        <option value="React">React</option>
                        <option value="Vue">Vue</option>
                        <option value="Angular">Angular</option>
                    </select>
                </div>
            )}
            {projectType === 'folder' && (
                <div>
                    <input
                        type="text"
                        placeholder="Folder Path"
                        value={folderPath}
                        onChange={(e) => setFolderPath(e.target.value)}
                    />
                </div>
            )}
            {projectType === 'clone' && (
                <div>
                    <input
                        type="text"
                        placeholder="Repository Link"
                        value={repoLink}
                        onChange={(e) => setRepoLink(e.target.value)}
                    />
                </div>
            )}
            <button onClick={handleAddProject}>{getButtonText()}</button>
            <button onClick={() => console.log('Cancelled')}>Cancel</button>
        </div>
    );
};

export default AddProject;