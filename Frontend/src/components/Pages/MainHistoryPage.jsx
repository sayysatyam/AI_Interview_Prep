import React, { useState } from 'react'
import History from './History';
import CodeHistory from './CodingPages/codeHistory';
const MainHistoryPage = () => {
    const [selectHistory, setselectHistory] = useState("Interview");
  return (
    <div>
      <div className='flex items-center justify-around '>
        <div className="flex items-center gap-5 p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit">

  <button
    onClick={() => setselectHistory("Interview")}
    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
      ${
        selectHistory === "Interview"
          ? "bg-slate-900 text-white shadow-md"
          : "text-slate-600 hover:bg-white hover:text-slate-900"
      }`}
  >
    Interview
  </button>

  <button
    onClick={() => setselectHistory("Coding")}
    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
      ${
        selectHistory === "Coding"
          ? "bg-slate-900 text-white shadow-md"
          : "text-slate-600 hover:bg-white hover:text-slate-900"
      }`}
  >
    Coding
  </button>

</div>
      </div>

      {selectHistory === "Interview" && (
        <History/>
      )}
      {selectHistory === "Coding" &&(
        <CodeHistory/>
      )}
    </div>
  )
}

export default MainHistoryPage
