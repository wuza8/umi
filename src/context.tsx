import React, { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

export enum AppPage {
    QuickStart, System, ChatBot, Docs, Editor, Schema, Tasks, NewTask
}

export enum WorkflowType{
    Unknown
}

export enum ChatRole {
    User, Assistant, System
}

export type ChatMessage = {
    sender: ChatRole,
    content: String
}

export type Workflow = {
    workflow_id: String,
    workflow_name: String,
    workflow_type: WorkflowType,
    chat_history: ChatMessage[],
    task_history: ChatMessage[],
    attached_script_id: number,
    stages: Stage[]
}

export type Stage = {
    stage_name: String,
    tasks: Task[],
    script: String,
}

export type Task = {
    name: String,
    status: TaskStatus,
}

export enum TaskStatus {
    Waiting,
    InProgress,
    Done,
}

export function get_todo_list(workflow: Workflow): Task[] {
    let table : Task[] = [];

    workflow.stages.forEach((stage)=>{
        stage.tasks.forEach((task) => {
            table.push(task)
        })
    })

    return table;
}

export type AppState = {
    is_opened: boolean,
    opened_page: AppPage,
    workflows: Workflow[],
    active_workflow_id: String,
    workflow_templates: any
}

// Tworzymy kontekst
export type AppStateType = {
    state: AppState,
    setState: (state: AppState) => void
}

export const AppContext = createContext<AppStateType | undefined>(undefined);

type AppProviderProps = {
  children: ReactNode; // Określamy typ dla children
};

export const StateProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [state, setState] = useState<AppState>({active_workflow_id: 0, workflows: [], is_opened:false, opened_page: AppPage.QuickStart, workflow_templates:[]});

    return (
        <AppContext.Provider value={{ state, setState }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = (): AppStateType => {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("useAppContext must be used within a StateProvider");
    }

    return context;
};