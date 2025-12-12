import React, { useState } from 'react';
import { UserRole, UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [age, setAge] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!age) return;
    onComplete({ role, age: parseInt(age) });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center transform transition-all hover:scale-105 duration-300">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to GrammarGuru</h1>
        <p className="text-gray-500 mb-8">Let's personalize your learning experience.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-left">
            <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole(UserRole.STUDENT)}
                className={`p-4 rounded-xl border-2 transition-all ${role === UserRole.STUDENT ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-indigo-200'}`}
              >
                <span className="text-2xl block mb-1">🎓</span>
                <span className="font-semibold">Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole(UserRole.TEACHER)}
                className={`p-4 rounded-xl border-2 transition-all ${role === UserRole.TEACHER ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-indigo-200'}`}
              >
                <span className="text-2xl block mb-1">🍎</span>
                <span className="font-semibold">Teacher</span>
              </button>
            </div>
          </div>

          <div className="text-left">
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">My Age</label>
            <input
              type="number"
              id="age"
              min="4"
              max="120"
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors text-lg"
              placeholder="e.g., 10"
            />
          </div>

          <button
            type="submit"
            disabled={!age}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Start Learning
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
