
import { useGenieContext } from "@/app/contexts/GenieContext";

export const useGenie = () => {
  const {
    state,
    setState,
    goal,
    setGoal,
    experience,
    setExperience,
    tourStep,
    setTourStep,
  } = useGenieContext();

  return {
    state,
    setState,
    goal,
    setGoal,
    experience,
    setExperience,
    tourStep,
    setTourStep,
  };
};