import { useReducer, useState, useEffect } from "react";

import { CsvDropzone, CsvRow } from "./CsvDropzone";
import { updateBattleRoyale, BrRow } from "./BattleRoyale";
import { StatusComponent, Status } from "./Status";
import Modal from "react-modal";

Modal.setAppElement("#root");

export default function App() {
  const savedState = JSON.parse(
    localStorage.getItem("battleRoyaleState") || "{}"
  );

  const [numEliminate, setNumEliminate] = useState(
    savedState.numEliminate || 1
  );
  const [brRows, dispatch] = useReducer(
    updateBattleRoyale,
    savedState.brRows || {
      remainingPlayers: [],
      eliminatedPlayers: [],
      newPlayers: [],
    }
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const stateToSave = {
      numEliminate,
      brRows,
    };
    localStorage.setItem("battleRoyaleState", JSON.stringify(stateToSave));
  }, [numEliminate, brRows]);

  const clearLocalStorage = () => {
    localStorage.removeItem("battleRoyaleState");
    dispatch({ type: "reset" });
  };

  const numAlive =
    brRows.remainingPlayers.filter((row) => row.alive).length +
    brRows.eliminatedPlayers.filter((row) => row.alive).length;

  function tableRow(row: BrRow, idx: number | string, rowType: Status) {
    return (
      <tr
        key={row.username}
        className={`border-b-2 border-gray-500 ${
          row.alive ? `bg-gray-700` : `bg-gray-400`
        } ${row.alive ? `text-white` : `text-gray-700`}`}
      >
        <td className="px-2 py-1">{idx}</td>
        <td className="px-2 py-1">{row.username}</td>
        <td className="px-2 py-1">{row.totalScore}</td>
        <td className="px-2 py-1">
          <StatusComponent
            alive={row.alive}
            rowType={rowType}
            onClick={() =>
              dispatch({
                type: "toggleState",
                payload: { username: row.username },
              })
            }
          />
        </td>
      </tr>
    );
  }

  return (
    <div className="bg-black text-white w-screen h-screen overflow-auto flex flex-col items-center">
      <CsvDropzone
        onParsedData={(data: CsvRow[]) =>
          dispatch({
            type: "game",
            payload: { data, numEliminate: numEliminate },
          })
        }
      />
      <table className="w-5/6 max-w-4xl rounded-xl text-center table-auto mb-4">
        <thead className="bg-gray-800">
          <tr className="border-b-2">
            <th className="p-3 text-xl">Position</th>
            <th className="p-3 text-xl">Player</th>
            <th className="p-3 text-xl">Last Game</th>
            <th className="p-3 text-xl">{`Status ( ${numAlive}💚 )`}</th>
          </tr>
        </thead>
        <tbody>
          {brRows.remainingPlayers.map((r, idx) =>
            tableRow(r, idx + 1, Status.Remaining)
          )}
          {brRows.eliminatedPlayers.map((r, idx) =>
            tableRow(
              r,
              idx + brRows.remainingPlayers.length + 1,
              Status.Eliminated
            )
          )}
        </tbody>
      </table>
      <div className="flex flex-row bg-gray-800 rounded-md p-3 mt-8 text-lg items-center">
        <label htmlFor="num-eliminated"># Players to eliminate: </label>
        <input
          className="bg-gray-400 text-gray-950 w-16 ml-4 text-center rounded-lg p-1"
          type="number"
          value={numEliminate}
          onChange={(e: any) => setNumEliminate(e.target.value)}
        ></input>
      </div>
      <div className="p-4">
        {/* Clear Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Clear Local Storage
        </button>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-auto transform transition duration-300 scale-100"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300"
          closeTimeoutMS={100}
        >
          <h2 className="text-lg font-bold mb-4">Confirm Action</h2>
          <p className="mb-6">Are you sure you want to clear all saved data?</p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => {
                clearLocalStorage();
                setIsModalOpen(false);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Confirm
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
