import React from 'react'
import SettingsFormPrecise from './components/SettingsFormPrecise'

export default function App() {
  return (
    <div className="container">
      <h1>Flyrank Capstone — Settings Form</h1>
      <p>Round 2: precise prompt implementation</p>
      <SettingsFormPrecise onSave={(d) => alert('Saved: ' + JSON.stringify(d))} />
    </div>
  )
}
