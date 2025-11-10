"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X } from 'lucide-react'
import { useWorkout } from '@/context/WorkoutContext'
import { toast } from 'sonner'

interface Exercise {
  name: string
  sets: string
  reps: string
}

interface WorkoutInputDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function WorkoutInputDialog({ open: controlledOpen, onOpenChange }: WorkoutInputDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>([{ name: '', sets: '', reps: '' }])
  const [difficulty, setDifficulty] = useState<'easy' | 'moderate' | 'hard'>('moderate')
  const [notes, setNotes] = useState('')
  const { addWorkout } = useWorkout()

  // Use controlled or uncontrolled state
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: '', reps: '' }])
  }

  const removeExercise = (index: number) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((_, i) => i !== index))
    }
  }

  const updateExercise = (index: number, field: keyof Exercise, value: string) => {
    const updated = [...exercises]
    updated[index] = { ...updated[index], [field]: value }
    setExercises(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate that at least one exercise has all fields filled
    const validExercises = exercises.filter(ex => ex.name && ex.sets && ex.reps)
    
    if (validExercises.length === 0) {
      alert('Please add at least one complete exercise')
      return
    }

    // Submit workout
    addWorkout({
      exercises: validExercises.map(ex => ({
        name: ex.name,
        sets: parseInt(ex.sets),
        reps: parseInt(ex.reps),
        formScore: Math.floor(Math.random() * 15) + 80 // Mock form score
      })),
      difficulty,
      notes: notes || undefined
    })

    // Show success toast
    toast.success('Workout logged successfully!', {
      description: `${validExercises.length} exercise${validExercises.length > 1 ? 's' : ''} added to your history`,
    })

    // Reset form and close
    setExercises([{ name: '', sets: '', reps: '' }])
    setDifficulty('moderate')
    setNotes('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Log Workout
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Your Workout</DialogTitle>
          <DialogDescription>
            Track your exercises, sets, and reps to monitor your progress
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Exercises</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExercise}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Exercise
              </Button>
            </div>

            {exercises.map((exercise, index) => (
              <div key={index} className="grid gap-3 p-4 border rounded-lg relative">
                {exercises.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeExercise(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                
                <div className="grid gap-2">
                  <Label htmlFor={`exercise-${index}`}>Exercise Name</Label>
                  <Input
                    id={`exercise-${index}`}
                    placeholder="e.g., Barbell Squats"
                    value={exercise.name}
                    onChange={(e) => updateExercise(index, 'name', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor={`sets-${index}`}>Sets</Label>
                    <Input
                      id={`sets-${index}`}
                      type="number"
                      min="1"
                      placeholder="3"
                      value={exercise.sets}
                      onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`reps-${index}`}>Reps</Label>
                    <Input
                      id={`reps-${index}`}
                      type="number"
                      min="1"
                      placeholder="10"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="difficulty">Perceived Difficulty</Label>
            <Select value={difficulty} onValueChange={(value: 'easy' | 'moderate' | 'hard') => setDifficulty(value)}>
              <SelectTrigger id="difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="Any observations or how you felt..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Workout
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

