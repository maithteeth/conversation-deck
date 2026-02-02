"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Shuffle, Trash2, ChevronRight, HelpCircle, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type ConversationCard = { id: string; text: string }
type Deck = { id: string; name: string; cards: ConversationCard[] }

export default function ConversationDeck() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [selectedDeckId, setSelectedDeckId] = useState<string>("")
  const [newDeckName, setNewDeckName] = useState("")
  const [newCardText, setNewCardText] = useState("")
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [activeTab, setActiveTab] = useState("play")
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const PRESET_DECK: Deck = {
    id: "preset-1",
    name: "はじめての会話デッキ",
    cards: [
      { id: "c1", text: "最近あった、ちょっといい話" },
      { id: "c2", text: "最近のマイブーム" },
      { id: "c3", text: "自分だけのこだわり" },
      { id: "c4", text: "笑える失敗談" }
    ]
  }

  // 初期読み込み
  useEffect(() => {
    const saved = localStorage.getItem("conv-decks")
    if (saved) {
      const parsed = JSON.parse(saved)
      setDecks(parsed)
      if (parsed.length > 0) setSelectedDeckId(parsed[0].id)
    } else {
      setDecks([PRESET_DECK])
      setSelectedDeckId(PRESET_DECK.id)
    }
  }, [])

  // 保存（空の配列も保存できるように if 文を削除）
  useEffect(() => {
    localStorage.setItem("conv-decks", JSON.stringify(decks))
  }, [decks])

  const selectedDeck = decks.find(d => d.id === selectedDeckId)

  const paginate = (newDirection: number) => {
    if (!selectedDeck?.cards || selectedDeck.cards.length === 0) return
    setDirection(newDirection)
    const nextIndex = (currentCardIndex + newDirection + selectedDeck.cards.length) % selectedDeck.cards.length
    setCurrentCardIndex(nextIndex)
  }

  const selectDeckAndPlay = (id: string) => {
    setSelectedDeckId(id)
    setCurrentCardIndex(0)
    setDirection(0)
    setActiveTab("play")
  }

  const addDeck = () => {
    if (!newDeckName) return
    const newDeck = { id: Date.now().toString(), name: newDeckName, cards: [] }
    setDecks([...decks, newDeck])
    setNewDeckName("")
    setSelectedDeckId(newDeck.id)
    setActiveTab("edit")
  }

  const deleteDeck = (id: string) => {
    const updatedDecks = decks.filter(d => d.id !== id)
    setDecks(updatedDecks)
    if (updatedDecks.length > 0) {
      setSelectedDeckId(updatedDecks[0].id)
    } else {
      setSelectedDeckId("")
    }
  }

  const addCard = () => {
    if (!newCardText || !selectedDeckId) return
    setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: [...d.cards, { id: Date.now().toString(), text: newCardText }] } : d))
    setNewCardText("")
  }

  return (
    <main className="min-h-[100dvh] bg-white text-zinc-900 px-4 py-2 font-sans antialiased tracking-tight flex flex-col">
      <div className="max-w-md mx-auto w-full space-y-2 flex-grow">
        <header className="py-1 border-b border-zinc-100 flex flex-col items-center">
          <h1 className="text-lg font-bold tracking-[0.3em] uppercase">Dialogue Deck</h1>
          <p className="text-[9px] font-medium text-zinc-400 tracking-widest">会話デッキでトーク</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-4">
            <TabsList className="bg-zinc-100/50 p-1 rounded-xl h-11 w-full max-w-[320px]">
              <TabsTrigger value="play" className="w-full rounded-lg py-1.5 text-xs font-bold data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-zinc-400 transition-all uppercase">PLAY</TabsTrigger>
              <TabsTrigger value="select" className="w-full rounded-lg py-1.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-zinc-900 text-zinc-400 transition-all">選択</TabsTrigger>
              <TabsTrigger value="edit" className="w-full rounded-lg py-1.5 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-zinc-900 text-zinc-400 transition-all">編成</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="play" className="m-0 outline-none">
            {selectedDeck?.cards && selectedDeck.cards.length > 0 ? (
              <div className="relative min-h-[78dvh] py-8 bg-zinc-50 rounded-[40px] flex flex-col items-center justify-between border border-zinc-100 shadow-inner px-4">
                <div className="relative w-full aspect-[4/5] z-10">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                      key={`${selectedDeckId}-${currentCardIndex}`}
                      custom={direction}
                      initial={{ opacity: 0, x: direction >= 0 ? 300 : -300 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction >= 0 ? -300 : 300 }}
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(_, info) => {
                        if (info.offset.x < -100) paginate(1)
                        else if (info.offset.x > 100) paginate(-1)
                      }}
                      onClick={() => paginate(1)}
                      className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    >
                      <Card className="w-full h-full bg-white border border-zinc-50 shadow-2xl rounded-[32px] flex flex-col items-center justify-center p-8">
                        <p className="text-4xl font-bold text-zinc-800 text-center leading-tight tracking-tighter select-none">
                          {selectedDeck.cards[currentCardIndex]?.text}
                        </p>
                      </Card>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="w-full flex gap-3 mt-6 z-10">
                  <Button onClick={() => {
                    const shuffled = [...selectedDeck.cards].sort(() => Math.random() - 0.5)
                    setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: shuffled } : d))
                    setCurrentCardIndex(0)
                  }} variant="outline" className="flex-1 border-zinc-200 text-zinc-400 bg-white hover:text-zinc-900 font-bold text-[9px] tracking-widest h-14 rounded-2xl">
                    <Shuffle className="mr-2" size={14}/> SHUFFLE
                  </Button>
                  <Button onClick={() => paginate(1)} className="flex-[2] bg-zinc-900 text-white hover:bg-zinc-800 h-14 rounded-2xl text-xs font-bold tracking-widest shadow-lg active:scale-95">
                    次のカードへ
                  </Button>
                </div>
              </div>
            ) : (
              <div className="min-h-[70vh] flex flex-col items-center justify-center bg-zinc-50 rounded-[40px] text-zinc-300 border border-dashed border-zinc-200 px-8 text-center">
                <span className="text-sm font-bold tracking-widest uppercase text-zinc-400">会話カードを登録してください</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="select" className="space-y-4 outline-none">
            <h3 className="text-[10px] font-bold text-zinc-300 tracking-[0.2em] uppercase px-1 text-center">使用するデッキを選択</h3>
            <div className="grid gap-3">
              {decks.map(d => (
                <button 
                  key={d.id} 
                  onClick={() => selectDeckAndPlay(d.id)}
                  className={`flex items-center justify-between p-6 rounded-[20px] border transition-all ${selectedDeckId === d.id ? "bg-zinc-900 border-zinc-900 text-white shadow-lg" : "bg-white border-zinc-100 text-zinc-600 shadow-sm"}`}
                >
                  <div className="flex flex-col items-start text-left">
                    <span className="font-bold text-base">{d.name}</span>
                    <span className={`text-[10px] mt-0.5 ${selectedDeckId === d.id ? "text-zinc-400" : "text-zinc-300"}`}>{d.cards.length} 枚</span>
                  </div>
                  <ChevronRight size={20} />
                </button>
              ))}
              {decks.length === 0 && <p className="text-center py-20 text-zinc-300 text-xs italic">デッキがありません</p>}
            </div>
          </TabsContent>

          <TabsContent value="edit" className="space-y-8 outline-none px-1">
            <section className="space-y-3">
              <h3 className="text-[10px] font-bold text-zinc-300 tracking-[0.2em] uppercase">会話デッキを新規作成</h3>
              <div className="flex gap-2">
                <Input placeholder="新しい会話デッキ名..." value={newDeckName} onChange={(e) => setNewDeckName(e.target.value)} className="bg-zinc-50 border-none h-14 rounded-2xl shadow-inner text-base px-5" />
                <Button onClick={addDeck} className="bg-zinc-900 text-white h-14 w-14 rounded-2xl shrink-0"><Plus size={24}/></Button>
              </div>
            </section>
            <section className="space-y-6">
              <h3 className="text-[10px] font-bold text-zinc-300 tracking-[0.2em] uppercase">デッキ編集</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {decks.map(d => (
                  <div key={d.id} className="relative group shrink-0">
                    <button onClick={() => setSelectedDeckId(d.id)} className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all ${selectedDeckId === d.id ? "bg-zinc-100 border-zinc-200 text-zinc-900 pr-10" : "bg-white border-zinc-100 text-zinc-300"}`}>
                      {d.name}
                    </button>
                    {selectedDeckId === d.id && (
                      <button onClick={(e) => { e.stopPropagation(); deleteDeck(d.id); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {selectedDeck && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="会話カードを追加..." value={newCardText} onChange={(e) => setNewCardText(e.target.value)} className="bg-zinc-50 border-none h-14 rounded-2xl shadow-inner text-base px-5" />
                    <Button onClick={addCard} className="bg-zinc-100 text-zinc-900 h-14 w-14 rounded-2xl shrink-0"><Plus size={24}/></Button>
                  </div>
                  <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedDeck?.cards?.map((c) => (
                      <div key={c.id} className="flex justify-between items-center p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                        <span className="text-sm text-zinc-600 font-bold">{c.text}</span>
                        <Button variant="ghost" size="sm" onClick={() => setDecks(decks.map(d => d.id === selectedDeckId ? { ...d, cards: d.cards.filter(card => card.id !== c.id) } : d))} className="text-zinc-300 hover:text-red-500"><Trash2 size={18}/></Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </TabsContent>
        </Tabs>
      </div>

      <footer className="py-4 flex justify-center">
        <Button variant="ghost" onClick={() => setIsHelpOpen(true)} className="text-zinc-300 hover:text-zinc-900 hover:bg-transparent text-[10px] font-bold tracking-widest gap-1 transition-colors">
          <HelpCircle size={14} /> 使い方
        </Button>
      </footer>

      <AnimatePresence>
        {isHelpOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsHelpOpen(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl border border-zinc-100 space-y-6 relative">
              <Button variant="ghost" size="sm" onClick={() => setIsHelpOpen(false)} className="absolute top-6 right-6 text-zinc-300 hover:text-zinc-900 rounded-full">
                <X size={20} />
              </Button>
              <h2 className="text-xl font-bold text-zinc-900 border-b border-zinc-50 pb-4">Dialogue Deck の使い方</h2>
              <div className="space-y-5 text-sm text-zinc-600 leading-relaxed font-medium">
                <p>1. <strong>「編成」タブ</strong>で新しい会話デッキを作成し、会話カードを追加してください。</p>
                <p>2. <strong>「選択」タブ</strong>で使用したいデッキをタップして選びます。</p>
                <p>3. <strong>「PLAY」タブ</strong>でカードをタップ、またはスワイプして次の話題へ進みましょう。</p>
              </div>
              <Button onClick={() => setIsHelpOpen(false)} className="w-full bg-zinc-900 text-white rounded-2xl h-14 font-bold shadow-lg shadow-zinc-200 active:scale-95 transition-all">対話を始める</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}