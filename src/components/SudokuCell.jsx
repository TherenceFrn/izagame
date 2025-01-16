function SudokuCell({ value, locked, onChange }) {
    if (locked) {
        return (
            <div
                className="w-[40px] h-[40px] bg-gray-100 border-[1px]
                   border-gray-300 text-center text-md flex items-center justify-center"
            >
        <span className="font-bold text-blue-600">
          {value !== 0 ? value : ''}
        </span>
            </div>
        )
    }

    return (
        <div
            className="w-[40px] h-[40px] bg-gray-100 border-[1px]
                 border-gray-300 text-center text-md flex items-center justify-center"
        >
            <input
                className="w-full h-full text-center bg-white"
                type="text"
                maxLength={1}
                onChange={onChange}
            />
        </div>
    )
}

export default SudokuCell
