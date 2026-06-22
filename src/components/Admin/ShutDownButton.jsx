// components/Admin/ShutdownButton.js
import { useState } from 'react';

export default function ShutdownButton({ initialShutdown }) {
    const [shutdown, setShutdown] = useState(initialShutdown);
    const [loading, setLoading] = useState(false);

    const toggle = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/shutdown', {
                method: 'POST',
                credentials: 'include',   // ← this sends the session cookie
            });;
            const data = await res.json();
            setShutdown(data.shutdown);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggle}
            disabled={loading}
            className={`px-4 py-2 rounded ${!shutdown ? 'bg-red-600' : 'bg-green-600'} text-white`}
        >
            {loading ? 'Updating...' : shutdown ? 'Enable Purchases' : 'Disable Purchases'}
        </button>
    );
}