import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  timezone: z.string().nonempty('Timezone is required'),
})

// Local resolver shim to avoid version mismatches between zod and resolvers
const zodResolverShim = (schema) => async (values) => {
  const result = schema.safeParse(values)
  if (result.success) return { values: result.data, errors: {} }
  const errors = {}
  for (const issue of result.error.issues) {
    const path = issue.path[0] || '_root'
    errors[path] = { type: issue.code, message: issue.message }
  }
  return { values: {}, errors }
}

export default function SettingsFormPrecise({ onSave }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolverShim(schema) })

  const submit = (data) => {
    if (onSave) onSave(data)
    return data
  }

  return (
    <form onSubmit={handleSubmit(submit)} aria-label="precise-settings-form">
      <div>
        <label htmlFor="username">Username</label>
        <input id="username" {...register('username')} aria-invalid={errors.username ? 'true' : 'false'} />
        {errors.username && (
          <div role="alert" className="error">
            {errors.username.message}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email')} aria-invalid={errors.email ? 'true' : 'false'} />
        {errors.email && (
          <div role="alert" className="error">
            {errors.email.message}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="timezone">Timezone</label>
        <select id="timezone" {...register('timezone')} aria-invalid={errors.timezone ? 'true' : 'false'}>
          <option value="">Select timezone</option>
          <option value="UTC">UTC</option>
          <option value="Local">Local</option>
        </select>
        {errors.timezone && (
          <div role="alert" className="error">
            {errors.timezone.message}
          </div>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        Save settings
      </button>
    </form>
  )
}
