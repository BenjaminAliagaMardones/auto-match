export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg text-center">
        <h1 className="text-2xl font-bold text-blue-600">AutoMatch</h1>
        <p className="mt-2 text-gray-600">¡Entorno de React Puro funcionando!</p>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Iniciar Sesión
        </button>
      </div>
    </div>
  );
}