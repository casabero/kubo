import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import { ExamPage } from './ExamPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                {/* <Route path="/student/exam/:id" element={<ExamPage />} /> */}
            </Routes>
        </BrowserRouter>
    )
}

export default App
