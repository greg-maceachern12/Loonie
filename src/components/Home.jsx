import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { DollarSign, Users, Globe, Check } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { COLOR_SCHEMES } from "../constants"; // Import the color schemes

const Home = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupEmoji, setGroupEmoji] = useState("🍔");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState("indigo-purple");

  const createNewGroup = async () => {
    if (!showNameInput) {
      setShowNameInput(true);
      return;
    }

    if (!groupName.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from("groups")
        .insert([
          {
            currency_default: "USD",
            name: groupName.trim(),
            emoji: groupEmoji,
            color_scheme: selectedScheme,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      navigate(`/g/${data.id}`);
    } catch (error) {
      console.error("Error creating group:", error);
    }
    setIsCreating(false);
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${COLOR_SCHEMES[selectedScheme].from} ${COLOR_SCHEMES[selectedScheme].via} ${COLOR_SCHEMES[selectedScheme].to}`}
    >
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-bold text-indigo-900 mb-4">
            Loonie
          </h1>
          <p className="text-xl sm:text-2xl text-indigo-900 mb-8">
            Split expenses with friends. Free and no signup required!
          </p>
          <div className="flex flex-col items-center gap-4">
            {showNameInput && (
              <div className="w-full max-w-md space-y-6">
                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-14 px-3 py-3 rounded-lg border border-purple-200 focus:border-purple-400 
                  focus:ring-2 focus:ring-purple-200 outline-none transition-all 
                  bg-white bg-opacity-80 text-2xl text-center hover:bg-opacity-70"
                    >
                      {groupEmoji}
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute mt-1 z-10">
                        <EmojiPicker
                          onEmojiClick={(emojiData) => {
                            setGroupEmoji(emojiData.emoji);
                            setShowEmojiPicker(false);
                          }}
                          width={300}
                          height={400}
                        />
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="px-4 py-3 rounded-lg border border-purple-200 focus:border-purple-400 
                focus:ring-2 focus:ring-purple-200 outline-none transition-all 
                bg-white bg-opacity-80 text-lg w-full"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-lg font-medium text-indigo-900">
                    Choose a color theme
                  </label>
                  <div className="flex flex-wrap justify-center gap-4">
                    {Object.entries(COLOR_SCHEMES).map(([key, scheme]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedScheme(key)}
                        className={`w-14 h-14 rounded-full ${
                          scheme.gradient
                        } relative
                    transform transition-all duration-200
                    ${
                      selectedScheme === key
                        ? "scale-110 ring-4 ring-white ring-opacity-60"
                        : "scale-100 hover:scale-105"
                    }
                    focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-60`}
                        title={scheme.name}
                      >
                        {selectedScheme === key && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Check className="w-8 h-8 text-white" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={createNewGroup}
              disabled={isCreating || (showNameInput && !groupName.trim())}
              className={`${COLOR_SCHEMES[selectedScheme].gradient} text-white px-8 py-4 rounded-xl 
                       text-lg font-semibold transition-all disabled:opacity-50
                       disabled:cursor-not-allowed shadow-lg hover:shadow-xl
                       transform hover:-translate-y-0.5 hover:opacity-90`}
            >
              {isCreating
                ? "Creating..."
                : showNameInput
                ? "Create Group"
                : "Start New Group"}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16">
          <div className="bg-white bg-opacity-60 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-indigo-800" />
            </div>
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">
              Simple Sharing
            </h3>
            <p className="text-indigo-800">
              Share a link with your group - no accounts needed
            </p>
          </div>

          <div className="bg-white bg-opacity-60 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-6 w-6 text-indigo-800" />
            </div>
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">
              Multi-Currency
            </h3>
            <p className="text-indigo-800">
              Track expenses in different currencies with automatic conversion
            </p>
          </div>

          <div className="bg-white bg-opacity-60 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="bg-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Globe className="h-6 w-6 text-indigo-700" />
            </div>
            <h3 className="text-lg font-semibold text-indigo-900 mb-2">
              Real-Time Updates
            </h3>
            <p className="text-indigo-800">
              See expenses update instantly across all devices
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white bg-opacity-60 backdrop-blur-lg rounded-xl p-8">
          <h2 className="text-2xl font-bold text-indigo-900 mb-6 text-center">
            How It Works
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-indigo-800 font-semibold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900 mb-1">
                  Create a Group
                </h3>
                <p className="text-indigo-800">
                  Click "Start New Group" to get your unique sharing link
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-indigo-800 font-semibold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900 mb-1">
                  Share with Friends
                </h3>
                <p className="text-indigo-800">
                  Send the link to your group members - no signup required
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-indigo-800 font-semibold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900 mb-1">
                  Track Expenses
                </h3>
                <p className="text-indigo-800">
                  Add expenses and see who owes what in real-time
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
