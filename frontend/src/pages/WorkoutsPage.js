import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { workoutsAPI, aiAPI, exercisesAPI } from "../utils/api";
import {
  MdAdd,
  MdFitnessCenter,
  MdClose,
  MdPsychology,
  MdSearch,
  MdDelete,
  MdEdit,
  MdPlayArrow,
  MdPublic,
  MdLock,
} from "react-icons/md";
import toast from "react-hot-toast";

const CATEGORIES = [
  "strength",
  "cardio",
  "hiit",
  "yoga",
  "pilates",
  "crossfit",
  "powerlifting",
  "bodybuilding",
  "calisthenics",
  "custom",
];
const DIFFICULTIES = ["beginner", "intermediate", "advanced", "elite"];

const normalizeExerciseName = (name = "") =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "");

const findMatchingExercise = (item, allExercises) => {
  const exerciseId =
    typeof item.exercise === "object" && item.exercise !== null
      ? item.exercise._id
      : item.exercise;

  // First, match using the database ID.
  if (exerciseId) {
    const byId = allExercises.find(
      (exercise) => String(exercise._id) === String(exerciseId)
    );

    if (byId) return byId;
  }

  // Match using the saved exercise name or its aliases.
  const savedName = normalizeExerciseName(
    item.exerciseName ||
      (typeof item.exercise === "object" ? item.exercise?.name : "")
  );

  const exactMatch = allExercises.find((exercise) =>
    [
      exercise.name,
      ...(exercise.alternativeNames || []),
    ].some((name) => normalizeExerciseName(name) === savedName)
  );

  if (exactMatch) return exactMatch;

  // Known legacy names: map only to equivalent exercises.
  const aliases = {
    bentoverrow: ["bentoverbarbellrow", "bentoverrow"],
    singlearmdumbbellrow: ["onearmdumbbellrow", "singlearmdumbbellrow"],
    dumbbellpullovers: ["dumbbellpullover", "dumbbellpullovers"],
    renegaderow: ["renegaderow"],
    reversefly: ["reversedumbbellfly", "dumbbellreversefly"],
  };

  const possibleNames = aliases[savedName] || [];

  return allExercises.find((exercise) =>
    [
      exercise.name,
      ...(exercise.alternativeNames || []),
    ].some((name) =>
      possibleNames.includes(normalizeExerciseName(name))
    )
  );
};

function AIGenerateModal({ onCreated, onClose }) {
  const [form, setForm] = useState({
    goal: "",
    fitnessLevel: "intermediate",
    equipment: [],
    duration: 60,
    muscleGroups: [],
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const EQUIP = [
    "barbell",
    "dumbbell",
    "kettlebell",
    "cable",
    "machine",
    "bodyweight",
    "resistance band",
    "pull-up bar",
  ];
  const MUSCLES = [
    "chest",
    "back",
    "shoulders",
    "biceps",
    "triceps",
    "core",
    "quads",
    "hamstrings",
    "glutes",
    "calves",
    "full body",
  ];

  const toggle = (field, val) =>
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(val)
        ? f[field].filter((x) => x !== val)
        : [...f[field], val],
    }));

  const handleGenerate = async () => {
    if (!form.goal.trim()) return toast.error("Please enter a goal");
    setLoading(true);
    try {
      const res = await aiAPI.generateWorkout(form);
      toast.success("AI workout generated! 🤖");
      onCreated(res.data);
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Generation failed — check OpenAI API key",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 600 }}
      >
        <div className="modal-header">
          <h3
            style={{
              fontFamily: "var(--font-condensed)",
              fontSize: 20,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <MdPsychology size={22} color="var(--purple)" /> AI Workout
            Generator
          </h3>
          <button
            onClick={onClose}
            style={{ color: "var(--text-2)", display: "flex" }}
          >
            <MdClose size={22} />
          </button>
        </div>
        <div
          className="modal-body"
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div className="form-group">
            <label className="form-label">What's your goal?</label>
            <input
              className="form-input"
              placeholder="e.g. Build upper body strength, lose fat, improve endurance..."
              value={form.goal}
              onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
            />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Fitness Level</label>
              <select
                className="form-select"
                value={form.fitnessLevel}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fitnessLevel: e.target.value }))
                }
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <input
                className="form-input"
                type="number"
                min={15}
                max={120}
                value={form.duration}
                onChange={(e) =>
                  setForm((f) => ({ ...f, duration: Number(e.target.value) }))
                }
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Equipment Available</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {EQUIP.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => toggle("equipment", e)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 100,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: form.equipment.includes(e)
                      ? "var(--accent-dim)"
                      : "var(--bg-3)",
                    color: form.equipment.includes(e)
                      ? "var(--accent)"
                      : "var(--text-2)",
                    border: `1px solid ${form.equipment.includes(e) ? "var(--accent)" : "var(--border)"}`,
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Target Muscles</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {MUSCLES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggle("muscleGroups", m)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 100,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: form.muscleGroups.includes(m)
                      ? "var(--blue-dim)"
                      : "var(--bg-3)",
                    color: form.muscleGroups.includes(m)
                      ? "var(--blue)"
                      : "var(--text-2)",
                    border: `1px solid ${form.muscleGroups.includes(m) ? "var(--blue)" : "var(--border)"}`,
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Additional Notes</label>
            <textarea
              className="form-textarea"
              placeholder="Any injuries, preferences, or special requirements..."
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" /> Generating...
              </>
            ) : (
              <>
                <MdPsychology size={16} /> Generate Workout
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkoutModal({ workout: initial, onSaved, onClose }) {
  // const [form, setForm] = useState(
  //   initial || {
  //     name: "",
  //     description: "",
  //     category: "strength",
  //     difficulty: "intermediate",
  //     isPublic: true,
  //     muscleGroups: [],
  //     tags: [],
  //     exercises: [],
  //   },
  // );
  const [form, setForm] = useState(() => {
    if (!initial) {
      return {
        name: "",
        description: "",
        category: "strength",
        difficulty: "intermediate",
        isPublic: true,
        muscleGroups: [],
        tags: [],
        exercises: [],
      };
    }

    return {
      ...initial,
      exercises: (initial.exercises || []).map((item) => ({
        ...item,

        // Preserve the actual Exercise ID when populated or unpopulated.
        exercise:
          typeof item.exercise === "object" && item.exercise !== null
            ? item.exercise._id
            : item.exercise,

        // Preserve the display name separately.
        exerciseName:
          item.exerciseName ||
          (typeof item.exercise === "object" ? item.exercise?.name : "") ||
          "",

        sets: (item.sets || []).map((set, index) => ({
          ...set,
          setNumber: set.setNumber || index + 1,
          restTime: set.restTime ?? 90,
        })),
      })),
    };
  });

  const [exerciseSearch, setExerciseSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(true);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        const response = await exercisesAPI.list({ limit: 100 });
        const data = response.data;

        const exercises = Array.isArray(data)
          ? data
          : Array.isArray(data.exercises)
            ? data.exercises
            : Array.isArray(data.data)
              ? data.data
              : [];

        console.log(
  "EXERCISE LIBRARY:",
  exercises.map((e) => ({
    id: e._id,
    name: e.name,
    alternativeNames: e.alternativeNames,
  }))
);

        setAllExercises(exercises);
      } catch (error) {
        console.error("Failed to load exercises:", error);
        setAllExercises([]);
      } finally {
        setLoadingExercises(false);
      }
    };

    loadExercises();
  }, []);

  useEffect(() => {
    const search = exerciseSearch.trim().toLowerCase();

    if (!search) {
      setSearchResults([]);
      return;
    }

    const results = allExercises
      .filter((exercise) => {
        const name = exercise.name?.toLowerCase() || "";
        const alternatives = Array.isArray(exercise.alternativeNames)
          ? exercise.alternativeNames.join(" ").toLowerCase()
          : "";

        return name.includes(search) || alternatives.includes(search);
      })
      .slice(0, 10);

    setSearchResults(results);
  }, [exerciseSearch, allExercises]);

  const addExercise = (exercise) => {
    const alreadyAdded = form.exercises.some(
      (item) => item.exercise === exercise._id,
    );

    if (alreadyAdded) {
      toast.error("Exercise already added");
      return;
    }

    setForm((current) => ({
      ...current,
      exercises: [
        ...current.exercises,
        {
          exercise: exercise._id,
          exerciseName: exercise.name,
          sets: [
            {
              setNumber: 1,
              reps: 10,
              weight: 0,
              restTime: 90,
            },
          ],
        },
      ],
    }));

    setExerciseSearch("");
    setSearchResults([]);
  };

  const removeExercise = (index) => {
    setForm((current) => ({
      ...current,
      exercises: current.exercises.filter(
        (_, exerciseIndex) => exerciseIndex !== index,
      ),
    }));
  };

  const updateExerciseSet = (exerciseIndex, setIndex, field, value) => {
    setForm((current) => {
      const exercises = [...current.exercises];

      exercises[exerciseIndex] = {
        ...exercises[exerciseIndex],
        sets: exercises[exerciseIndex].sets.map((set, index) =>
          index === setIndex
            ? {
                ...set,
                [field]: value,
              }
            : set,
        ),
      };

      return {
        ...current,
        exercises,
      };
    });
  };

  const addSet = (exerciseIndex) => {
    setForm((current) => {
      const exercises = [...current.exercises];
      const exercise = exercises[exerciseIndex];

      exercises[exerciseIndex] = {
        ...exercise,
        sets: [
          ...exercise.sets,
          {
            setNumber: exercise.sets.length + 1,
            reps: 10,
            weight: 0,
            restTime: 90,
          },
        ],
      };

      return {
        ...current,
        exercises,
      };
    });
  };

  // const handleSave = async () => {
  //   if (!form.name.trim()) {
  //     return toast.error("Workout name required");
  //   }

  //   if (form.exercises.length === 0) {
  //     return toast.error("Add at least one exercise");
  //   }

  //   setSaving(true);

  //   try {
  //     console.log(
  //       "Exercises being saved:",
  //       form.exercises.map((item) => ({
  //         exercise: item.exercise,
  //         exerciseName: item.exerciseName,
  //         hasId: Boolean(
  //           typeof item.exercise === "string"
  //             ? item.exercise
  //             : item.exercise?._id,
  //         ),
  //       })),
  //     );
  //     const response = initial?._id
  //       ? await workoutsAPI.update(initial._id, form)
  //       : await workoutsAPI.create(form);

  //     toast.success(initial ? "Workout updated!" : "Workout created!");

  //     onSaved(response.data);
  //     onClose();
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || "Failed to save workout");
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handleSave = async () => {
    if (!form.name.trim()) {
      return toast.error("Workout name required");
    }

    if (form.exercises.length === 0) {
      return toast.error("Add at least one exercise");
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        exercises: form.exercises.map((item) => {
          // Recover the Exercise ID if it is missing.
          const exerciseId =
            typeof item.exercise === "object" && item.exercise !== null
              ? item.exercise._id
              : item.exercise;

          // const matchedExercise = allExercises.find(
          //   (exercise) =>
          //     exercise._id === exerciseId ||
          //     exercise.name?.toLowerCase() === item.exerciseName?.toLowerCase(),
          // );
          const matchedExercise = findMatchingExercise(item, allExercises);
          console.log("EXERCISE MATCH DEBUG:", {
  savedName: item.exerciseName,
  savedId: item.exercise,
  matchedName: matchedExercise?.name,
  matchedId: matchedExercise?._id,
});

          return {
            ...item,
            exercise: exerciseId || matchedExercise?._id,
            exerciseName: item.exerciseName || matchedExercise?.name,
          };
        }),
      };

      // Stop before sending invalid exercise entries.
      const invalidExercises = payload.exercises.filter(
        (item) => !item.exercise,
      );

      if (invalidExercises.length > 0) {
        return toast.error(
          `Could not find exercise: ${invalidExercises
            .map((item) => item.exerciseName || "Unknown")
            .join(", ")}. Remove it and add it again using exercise search.`,
        );
      }

      console.log("Workout ID:", initial?._id);
      console.log("Exercises being saved:", payload.exercises);

      const response = initial?._id
        ? await workoutsAPI.update(initial._id, payload)
        : await workoutsAPI.create(payload);

      toast.success(initial?._id ? "Workout updated!" : "Workout created!");
      onSaved(response.data);
      onClose();
    } catch (error) {
      console.error(
        "Save workout error:",
        error.response?.data || error.message,
      );

      toast.error(error.response?.data?.message || "Failed to save workout");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(event) => event.stopPropagation()}
        style={{
          maxWidth: 680,
          maxHeight: "90vh",
        }}
      >
        <div className="modal-header">
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {initial ? "Edit Workout" : "Create Workout"}
          </h3>

          <button
            type="button"
            onClick={onClose}
            style={{
              color: "var(--text-2)",
              display: "flex",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <MdClose size={22} />
          </button>
        </div>

        <div
          className="modal-body"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            overflowY: "auto",
            maxHeight: "65vh",
          }}
        >
          <div className="form-group">
            <label className="form-label">Workout Name *</label>

            <input
              className="form-input"
              placeholder="e.g. Push Day A"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>

            <textarea
              className="form-textarea"
              placeholder="What's this workout about?"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>

              <select
                className="form-select"
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Difficulty</label>

              <select
                className="form-select"
                value={form.difficulty}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    difficulty: event.target.value,
                  }))
                }
              >
                {DIFFICULTIES.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Visibility</label>

            <div
              style={{
                display: "flex",
                gap: 10,
              }}
            >
              {[
                {
                  value: true,
                  icon: MdPublic,
                  label: "Public",
                },
                {
                  value: false,
                  icon: MdLock,
                  label: "Private",
                },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      isPublic: value,
                    }))
                  }
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: 10,
                    borderRadius: 8,
                    cursor: "pointer",
                    background:
                      form.isPublic === value
                        ? "var(--accent-dim)"
                        : "var(--bg-3)",
                    color:
                      form.isPublic === value
                        ? "var(--accent)"
                        : "var(--text-2)",
                    border: `1px solid ${
                      form.isPublic === value
                        ? "var(--accent)"
                        : "var(--border)"
                    }`,
                  }}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              className="form-label"
              style={{
                display: "block",
                marginBottom: 8,
              }}
            >
              Exercises
            </label>

            {form.exercises.map((exercise, exerciseIndex) => (
              <div
                key={`${exercise.exercise}-${exerciseIndex}`}
                style={{
                  background: "var(--bg-3)",
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {exercise.exerciseName}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeExercise(exerciseIndex)}
                    style={{
                      color: "var(--text-3)",
                      display: "flex",
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                    }}
                  >
                    <MdClose size={18} />
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "24px 1fr 1fr 1fr",
                    gap: 6,
                    marginBottom: 8,
                    alignItems: "center",
                    padding: "0 0 0 0",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-3)",
                      textAlign: "center",
                      textTransform: "uppercase",
                    }}
                  >
                    Set
                  </span>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-3)",
                      textAlign: "center",
                      textTransform: "uppercase",
                    }}
                  >
                    Weight
                  </span>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-3)",
                      textAlign: "center",
                      textTransform: "uppercase",
                    }}
                  >
                    Reps
                  </span>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--text-3)",
                      textAlign: "center",
                      textTransform: "uppercase",
                    }}
                  >
                    Rest
                  </span>
                </div>

                {exercise.sets.map((set, setIndex) => (
                  <div
                    key={setIndex}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "24px 1fr 1fr 1fr",
                      gap: 6,
                      marginBottom: 6,
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-3)",
                        textAlign: "center",
                      }}
                    >
                      {setIndex + 1}
                    </span>

                    <input
                      className="form-input"
                      style={{
                        padding: 6,
                        textAlign: "center",
                        fontSize: 13,
                      }}
                      type="number"
                      placeholder="kg"
                      value={set.weight}
                      onChange={(event) =>
                        updateExerciseSet(
                          exerciseIndex,
                          setIndex,
                          "weight",
                          Number(event.target.value),
                        )
                      }
                    />

                    <input
                      className="form-input"
                      style={{
                        padding: 6,
                        textAlign: "center",
                        fontSize: 13,
                      }}
                      type="number"
                      placeholder="reps"
                      value={set.reps}
                      onChange={(event) =>
                        updateExerciseSet(
                          exerciseIndex,
                          setIndex,
                          "reps",
                          Number(event.target.value),
                        )
                      }
                    />

                    <input
                      className="form-input"
                      style={{
                        padding: 6,
                        textAlign: "center",
                        fontSize: 13,
                      }}
                      type="number"
                      placeholder="rest(s)"
                      value={set.restTime}
                      onChange={(event) =>
                        updateExerciseSet(
                          exerciseIndex,
                          setIndex,
                          "restTime",
                          Number(event.target.value),
                        )
                      }
                    />
                  </div>
                ))}

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => addSet(exerciseIndex)}
                  style={{
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  <MdAdd size={14} />
                  Add Set
                </button>
              </div>
            ))}

            <div
              style={{
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "relative",
                }}
              >
                <MdSearch
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-3)",
                  }}
                  size={18}
                />

                <input
                  className="form-input"
                  style={{
                    paddingLeft: 40,
                  }}
                  placeholder={
                    loadingExercises
                      ? "Loading exercises..."
                      : "Search and add exercises..."
                  }
                  value={exerciseSearch}
                  disabled={loadingExercises}
                  onChange={(event) => setExerciseSearch(event.target.value)}
                />
              </div>

              {exerciseSearch.trim() && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    background: "var(--bg-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    zIndex: 100,
                    maxHeight: 240,
                    overflowY: "auto",
                    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.25)",
                  }}
                >
                  {searchResults.length > 0 ? (
                    searchResults.map((exercise) => (
                      <button
                        key={exercise._id}
                        type="button"
                        onClick={() => addExercise(exercise)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "11px 14px",
                          background: "transparent",
                          border: "none",
                          borderBottom: "1px solid var(--border)",
                          cursor: "pointer",
                          textAlign: "left",
                          color: "var(--text-1)",
                        }}
                      >
                        <MdFitnessCenter size={17} color="var(--accent)" />

                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          {exercise.name}
                        </span>

                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--text-3)",
                            marginLeft: "auto",
                            textTransform: "capitalize",
                          }}
                        >
                          {exercise.muscleGroup?.primary?.[0] || ""}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div
                      style={{
                        padding: "14px",
                        fontSize: 13,
                        color: "var(--text-3)",
                      }}
                    >
                      No exercises found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <span className="spinner" />
            ) : initial ? (
              "Save Changes"
            ) : (
              "Create Workout"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkoutCard({ workout, onEdit, onDelete, showActions = true }) {
  const navigate = useNavigate();
  const CATEGORY_COLORS = {
    strength: "var(--blue)",
    cardio: "var(--red)",
    hiit: "var(--orange)",
    powerlifting: "var(--purple)",
    bodybuilding: "var(--accent)",
    custom: "var(--text-2)",
  };
  const color = CATEGORY_COLORS[workout.category] || "var(--text-2)";

  return (
    <div
      className="card card-hover"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div style={{ padding: "16px", flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 10,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-condensed)",
                fontSize: 17,
                fontWeight: 700,
                marginBottom: 4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {workout.name}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color,
                  background: `${color}18`,
                  padding: "2px 8px",
                  borderRadius: 100,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {workout.category}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-3)",
                  background: "var(--bg-3)",
                  padding: "2px 8px",
                  borderRadius: 100,
                  textTransform: "capitalize",
                }}
              >
                {workout.difficulty}
              </span>
              {workout.aiGenerated && (
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--purple)",
                    background: "rgba(165,94,234,0.15)",
                    padding: "2px 8px",
                    borderRadius: 100,
                  }}
                >
                  🤖 AI
                </span>
              )}
            </div>
          </div>
          {!workout.isPublic && (
            <MdLock
              size={16}
              color="var(--text-3)"
              style={{ flexShrink: 0, marginLeft: 8 }}
            />
          )}
        </div>
        {workout.description && (
          <p
            style={{
              fontSize: 13,
              color: "var(--text-2)",
              marginBottom: 10,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {workout.description}
          </p>
        )}
        <div
          style={{
            display: "flex",
            gap: 12,
            fontSize: 12,
            color: "var(--text-3)",
          }}
        >
          <span>{workout.exercises?.length || 0} exercises</span>
          {workout.estimatedDuration && (
            <span>~{workout.estimatedDuration}min</span>
          )}
          {workout.timesUsed > 0 && <span>{workout.timesUsed}× used</span>}
        </div>
      </div>
      <div
        style={{
          padding: "10px 16px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          gap: 8,
        }}
      >
        <button
          className="btn btn-primary btn-sm"
          style={{ flex: 1 }}
          onClick={() => navigate("/session/active", { state: { workout } })}
        >
          <MdPlayArrow size={16} /> Start
        </button>
        <Link
          to={`/workouts/${workout._id}`}
          className="btn btn-secondary btn-sm"
        >
          View
        </Link>
        {showActions && (
          <>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onEdit(workout)}
              style={{ padding: "6px 8px" }}
            >
              <MdEdit size={16} />
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onDelete(workout._id)}
              style={{ padding: "6px 8px", color: "var(--red)" }}
            >
              <MdDelete size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [editWorkout, setEditWorkout] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    workoutsAPI
      .mine()
      .then((r) => setWorkouts(r.data))
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (workout) => {
    setWorkouts((prev) => {
      const idx = prev.findIndex((w) => w._id === workout._id);
      return idx >= 0
        ? prev.map((w) => (w._id === workout._id ? workout : w))
        : [workout, ...prev];
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this workout?")) return;
    try {
      await workoutsAPI.delete(id);
      setWorkouts((prev) => prev.filter((w) => w._id !== id));
      toast.success("Workout deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleAICreated = (aiWorkout) => {
    setShowCreate(true);
    setEditWorkout({ ...aiWorkout, _id: null });
  };

  const filtered = workouts.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="page-container animate-fade">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 44,
            letterSpacing: 2,
          }}
        >
          MY WORKOUTS
        </h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setShowAI(true)}>
            <MdPsychology size={18} color="var(--purple)" /> AI Generate
          </button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditWorkout(null);
              setShowCreate(true);
            }}
          >
            <MdAdd size={18} /> Create
          </button>
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: 24 }}>
        <MdSearch
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-3)",
          }}
          size={20}
        />
        <input
          className="form-input"
          style={{ paddingLeft: 44, width: "100%", maxWidth: 400 }}
          placeholder="Search your workouts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 160 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏋️</div>
          <h3
            style={{
              fontFamily: "var(--font-condensed)",
              fontSize: 22,
              marginBottom: 8,
            }}
          >
            {search ? "No workouts found" : "No workouts yet"}
          </h3>
          <p style={{ color: "var(--text-3)", marginBottom: 24 }}>
            {search
              ? "Try a different search term"
              : "Create your first workout or use AI to generate one!"}
          </p>
          {!search && (
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowAI(true)}
              >
                <MdPsychology size={16} /> AI Generate
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreate(true)}
              >
                <MdAdd size={16} /> Create Manually
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map((w) => (
            <WorkoutCard
              key={w._id}
              workout={w}
              onEdit={(w) => {
                setEditWorkout(w);
                setShowCreate(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showAI && (
        <AIGenerateModal
          onCreated={handleAICreated}
          onClose={() => setShowAI(false)}
        />
      )}
      {showCreate && (
        <WorkoutModal
          workout={editWorkout}
          onSaved={handleSaved}
          onClose={() => {
            setShowCreate(false);
            setEditWorkout(null);
          }}
        />
      )}
    </div>
  );
}
