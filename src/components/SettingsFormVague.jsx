import React from 'react'

export default function SettingsFormVague() {
  // Very simple, lazy implementation (one-sentence prompt style)
  const handleSubmit = (e) => {
    e.preventDefault()
    const form = e.target
    const data = {
      username: form.username.value,
      email: form.email.value,
      timezone: form.timezone.value,
    }
    // Minimal validation
    if (!data.username || !data.email) {
      alert('Please provide username and email')
      return
    }
    alert('Saved: ' + JSON.stringify(data))
  }

  return (
    <form onSubmit={handleSubmit} aria-label="vague-settings-form">
      <label>
        Username
        <input name="username" placeholder="Your name" />
      </label>

      <label>
        Email
        <input name="email" type="email" placeholder="you@example.com" />
      </label>

      <label>
        Timezone
        <select name="timezone">
          <option value="UTC">UTC</option>
          <option value="Local">Local</option>
        </select>
      </label>

      <button type="submit">Save</button>
    </form>
  )
}
