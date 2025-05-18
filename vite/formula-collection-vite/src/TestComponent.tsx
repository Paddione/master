// src/TestComponent.tsx
import React from 'react'

const TestComponent: React.FC = () => {
    return (
        <div className="p-8 text-center">
            <h1 className="text-3xl font-bold text-blue-600">Test Component</h1>
            <p className="mt-4">If you can see this, React is working!</p>
        </div>
    )
}

export default TestComponent