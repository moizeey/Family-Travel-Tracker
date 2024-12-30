import axios from "axios";
import { useEffect, useState } from "react";

function AddUser() {
  const [color, setColor] = useState("");
  const [name, setName] = useState("");

  const colorOptions = [
    "red",
    "green",
    "yellow",
    "olive",
    "orange",
    "indigo",
    "blue",
    "violet",
    "purple",
    "pink",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/newUser", {
        name: name,
        color: color,
      });
      window.location.href = "/";
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    console.log("name: ", name);
    console.log("color ", color);
  });

  return (
    <div className="min-h-screen bg-zinc-700 flex flex-col px-10 pt-10">
      <h1 className="text-center text-white capitalize text-3xl">
        Add a family member
      </h1>
      <form className="flex flex-col gap-4 pt-10" onSubmit={handleSubmit}>
        <p className="text-white font-mono">what's your name???</p>
        <input
          className="border-2 border-white outline-none rounded-md px-2 py-2"
          placeholder="name..."
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <p className="text-white font-mono">pickup your color!!!</p>
        <div className="flex items-center justify-center">
          {colorOptions.map((colorOption) => (
            <label
              className="peer cursor-pointer inline-block w-[25px] h-[25px] mr-[10px]     "
              key={colorOption}
            >
              <input
                className="peer hidden "
                type="radio"
                value={colorOption}
                checked={color === colorOption}
                onChange={(e) => setColor(e.target.value)}
              />
              <span
                className={`w-6 h-6 rounded-none peer-hover:scale-125  inline-block  peer-checked:scale-125 transition-transform duration-200 ease-in-out ${
                  color === colorOption
                    ? "ring-2 ring-offset-2 ring-[{colorOption}]"
                    : ""
                }`}
                style={{ backgroundColor: colorOption }}
              ></span>
            </label>
          ))}
        </div>
        <button
          className="border-2 border-white px-2 py-2 rounded-md text-white hover:text-black hover:bg-white"
          type="submit"
        >
          Add
        </button>
      </form>
    </div>
  );
}
export default AddUser;
