import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { formulaMap } from "@/lib/formulas";
import { normalizeFormulaName, generateVariables } from "@/lib/utils";
import { Task } from "@/lib/types";


export function useGame() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [variables, setVariables] = useState<any | null>(null);

    useEffect(() => {
        const fetchTasks = async () => {
            const { data, error } = await supabase.from("ivfall").select("*");

            if (error) {
                console.error("❌ Supabase Fehler:", error.message);
            } else if (!data || data.length === 0) {
                console.warn("⚠️ Keine Aufgaben geladen! Überprüfe Tabellenname und Inhalte.");
            } else {
                console.log("✅ Aufgaben erfolgreich geladen:", data.length);
                console.log("Beispiel-Aufgabe:", data[0]);
                setTasks(data as Task[]);
            }
        };
        fetchTasks();
    }, []);

    useEffect(() => {
        if (tasks.length > 0) {
            const task = tasks[currentTaskIndex];
            const formulaKey = normalizeFormulaName(task.type);
            setVariables(generateVariables(formulaKey));
        }
    }, [currentTaskIndex, tasks]);

    const currentTask = tasks[currentTaskIndex];
    const formulaKey = currentTask ? normalizeFormulaName(currentTask.type) : null;
    const formulaFn = formulaKey ? formulaMap[formulaKey] : null;
    const correctAnswer =
        formulaFn && variables ? formulaFn(variables).toFixed(2) : null;


//👇 Debug-Ausgabe in der Browserkonsole
    if (!formulaFn) {
        console.warn("⚠️ Keine Formel gefunden für Typ:", currentTask?.type);
    }
    return {
        tasks,
        currentTaskIndex,
        setCurrentTaskIndex,
        score,
        setScore,
        variables,
        currentTask,
        correctAnswer,
    };
}



