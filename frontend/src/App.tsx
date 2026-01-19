import Button from './components/Button'
import Card from './components/Card'
import Input from './components/Input'

function App() {
    return (
        <div className="min-h-screen p-12 max-w-4xl mx-auto space-y-12">
            <header className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">KuboApps</h1>
                <p className="text-sti-text opacity-60">Technical Minimalist Dashboard</p>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card title="System Control">
                    <div className="space-y-6">
                        <Input label="Process Name" placeholder="e.g. background-worker-01" />
                        <div className="flex gap-4">
                            <Button variant="primary">Deploy</Button>
                            <Button variant="dashed">Audit Log</Button>
                        </div>
                    </div>
                </Card>

                <Card title="Network Status">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="opacity-60">Backend Status:</span>
                            <span className="font-mono text-green-600">CONNECTED</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="opacity-60">Latency:</span>
                            <span className="font-mono">12ms</span>
                        </div>
                        <Button variant="secondary" className="w-full">Refresh Metrics</Button>
                    </div>
                </Card>
            </main>

            <footer className="pt-12 border-t border-sti-border text-[10px] uppercase tracking-widest opacity-40">
                © 2026 KuboApps // Technical Minimalist v1.0
            </footer>
        </div>
    )
}

export default App
