'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import NeuralCanvas from '../../../components/NeuralCanvas';

const TOPIC_DATA: Record<string, { title: string; icon: string; sections: { h: string; p: string }[] }> = {
  'neural-networks': {
    title: 'Neural Networks',
    icon: '🧠',
    sections: [
      { h: 'What is a Neural Network?', p: 'A neural network is a computational model inspired by the human brain. It consists of layers of interconnected "neurons" that process data, learn patterns, and make decisions. Each neuron receives input, applies a weight and bias, passes it through an activation function, and sends the output to the next layer.' },
      { h: 'The Perceptron', p: 'The perceptron, invented in 1958 by Frank Rosenblatt, is the simplest form of a neural network — a single neuron capable of binary classification. Modern neural networks stack hundreds of layers with millions of neurons, called deep neural networks (DNNs).' },
      { h: 'How Learning Works', p: 'Training a neural network involves three key steps: forward propagation (passing data through the network), loss calculation (measuring error), and backpropagation (adjusting weights to reduce error). This cycle repeats thousands of times until the network converges.' },
      { h: 'Real-World Applications', p: 'Neural networks power everything from facial recognition in smartphones to autonomous driving, medical diagnosis, language translation, and game-playing AIs like AlphaGo. The same underlying architecture can be adapted to nearly any pattern-recognition task.' },
    ],
  },
  'transformers': {
    title: 'Transformers & LLMs',
    icon: '⚡',
    sections: [
      { h: 'The Transformer Revolution', p: 'Introduced in Google\'s 2017 paper "Attention Is All You Need," the Transformer architecture replaced recurrent neural networks (RNNs) as the dominant paradigm in NLP. Its key innovation: the self-attention mechanism, which allows the model to weigh the importance of every word relative to every other word in a sequence.' },
      { h: 'How Attention Works', p: 'Self-attention computes three vectors for each input token: Query, Key, and Value. The Query and Key determine relevance scores between tokens, while the Value carries the actual information. This allows the model to "attend" to relevant context, even across long distances in text.' },
      { h: 'Scaling to LLMs', p: 'Large Language Models (LLMs) like GPT-4, Claude, and Llama scale Transformers to billions of parameters trained on trillions of tokens. Scaling laws show predictable improvement in capabilities as model size, data, and compute increase — leading to emergent abilities like reasoning, code generation, and tool use.' },
      { h: 'The Future', p: 'Current research focuses on extending context windows (Gemini 1M+ tokens), improving efficiency (Mixture of Experts, quantization), and adding multimodal capabilities (text, image, video, audio). The race toward AGI runs through Transformer architecture.' },
    ],
  },
  'computer-vision': {
    title: 'Computer Vision',
    icon: '👁️',
    sections: [
      { h: 'How Machines See', p: 'Computer vision is the field of AI that trains machines to interpret visual data. Instead of "seeing" like humans, CNNs (Convolutional Neural Networks) detect patterns of pixels — edges, textures, shapes, and objects — through hierarchical layers of filters.' },
      { h: 'Key Architectures', p: 'Modern vision relies on CNNs (ResNet, EfficientNet), Vision Transformers (ViT), and hybrid models. ViTs apply the Transformer self-attention mechanism to image patches, rivaling and often surpassing CNNs on large datasets.' },
      { h: 'Generative Vision', p: 'Diffusion models (Stable Diffusion, DALL-E, Midjourney) have revolutionized image generation. They work by gradually adding noise to training images, then learning to reverse the process — generating high-quality images from random noise conditioned on text prompts.' },
      { h: 'Real-World Impact', p: 'Computer vision is deployed in autonomous vehicles, medical imaging (tumor detection), manufacturing quality control, augmented reality, agriculture (crop monitoring), and security systems. The market exceeds $20B and is growing rapidly.' },
    ],
  },
  'reinforcement-learning': {
    title: 'Reinforcement Learning',
    icon: '🎮',
    sections: [
      { h: 'Learning Through Interaction', p: 'Reinforcement Learning (RL) trains agents to make sequences of decisions by interacting with an environment. The agent receives rewards for good actions and penalties for bad ones, learning a policy that maximizes cumulative reward over time.' },
      { h: 'The MDP Framework', p: 'RL is formalized as a Markov Decision Process (MDP): states, actions, transition probabilities, and rewards. The agent learns a value function estimating the expected return from each state, or a policy mapping states directly to actions.' },
      { h: 'Deep RL Breakthroughs', p: 'Deep RL combines neural networks with RL, enabling agents to handle high-dimensional state spaces like pixels. Landmark achievements: DQN playing Atari games, AlphaGo defeating Go world champions, and OpenAI Five beating Dota 2 professionals.' },
      { h: 'Modern Applications', p: 'RL powers robotics (grasping, locomotion), recommendation systems, autonomous driving, game AI, resource optimization (data center cooling), and financial trading. RLHF (Reinforcement Learning from Human Feedback) is critical to aligning LLMs like ChatGPT.' },
    ],
  },
  'rag-systems': {
    title: 'RAG & Knowledge Systems',
    icon: '📚',
    sections: [
      { h: 'What is RAG?', p: 'Retrieval-Augmented Generation (RAG) is a technique that enhances LLMs by retrieving relevant information from a knowledge base before generating a response. Instead of relying solely on the model\'s parametric memory, RAG gives the model access to external, updatable knowledge.' },
      { h: 'How It Works', p: 'A RAG system has three components: (1) an embedding model that converts documents into vector representations, (2) a vector database (like Pinecone, Weaviate, or pgvector) that stores and searches these embeddings, and (3) an LLM that generates answers conditioned on retrieved context.' },
      { h: 'Why RAG Matters', p: 'RAG solves three critical LLM problems: hallucinations (grounding responses in retrieved facts), staleness (knowledge can be updated without retraining), and data privacy (sensitive information stays in a private database).' },
      { h: 'Production RAG Stack', p: 'Modern RAG systems use chunking strategies, hybrid search (dense + keyword), re-ranking, and multi-hop retrieval. Advanced patterns include agentic RAG (the model decides when and what to retrieve) and self-RAG (the model critiques its own retrieved context).' },
    ],
  },
  'edge-ai': {
    title: 'Edge AI',
    icon: '📡',
    sections: [
      { h: 'Intelligence at the Edge', p: 'Edge AI runs machine learning models on local devices — phones, cameras, IoT sensors, cars — rather than in the cloud. This enables real-time inference with no latency, no internet dependency, and complete data privacy.' },
      { h: 'Why Edge AI is Exploding', p: 'Three trends drive Edge AI: (1) powerful mobile chips (Apple Neural Engine, Qualcomm AI Engine), (2) efficient model architectures (MobileNet, TinyML, Quantization), and (3) privacy regulations pushing processing off-cloud.' },
      { h: 'Key Technologies', p: 'Model compression techniques include quantization (reducing precision from FP32 to INT8), pruning (removing unnecessary connections), and knowledge distillation (training a small model to mimic a large one). Frameworks like TensorFlow Lite, ONNX Runtime, and CoreML make deployment seamless.' },
      { h: 'The Future', p: 'Edge AI is the backbone of the next trillion-device world. Smart glasses, autonomous drones, industrial sensors, and health monitors all require on-device intelligence. NVIDIA Jetson, Google Coral, and Apple\'s Neural Engine are leading the hardware revolution.' },
    ],
  },
};

export default function TopicPage() {
  const params = useParams();
  const topic = params?.topic as string;
  const [statusTime, setStatusTime] = useState('');

  useEffect(() => {
    const tick = () => setStatusTime(new Date().toLocaleTimeString([], { hour12: false }));
    tick(); const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  const data = TOPIC_DATA[topic];

  if (!data) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold orbitron mb-4">TOPIC NOT FOUND</h1>
          <p className="text-gray-500 mb-6">This neural pathway has not been mapped yet.</p>
          <a href="/learn" className="text-cyan-400 hover:text-cyan-300 underline text-sm">← Back to The Lab</a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="scanlines" />
      <NeuralCanvas />
      <div className="ui-layer min-h-screen flex flex-col">
        <nav className="w-full p-6 border-b border-cyan-500/30 backdrop-blur-md bg-black/40 flex flex-wrap justify-between items-center gap-2">
          <a href="/" className="text-2xl font-bold text-cyan-400 orbitron tracking-wider">NEURO<span className="text-pink-500">FLUX</span></a>
          <div className="flex gap-6 uppercase text-sm tracking-tighter">
            <a href="/" className="hover:text-cyan-400 transition text-gray-400">Live_Pulse</a>
            <a href="/learn" className="text-pink-400 border-b border-pink-400 pb-0.5">The_Lab</a>
            <a href="/archive" className="hover:text-cyan-400 transition text-gray-400">Archive</a>
          </div>
          <div className="text-xs text-cyan-600 animate-pulse">{statusTime} UTC</div>
        </nav>

        <section className="pt-16 pb-16 px-6 max-w-3xl mx-auto w-full">
          <a href="/learn" className="text-[10px] text-gray-600 hover:text-cyan-400 transition mb-4 inline-block tracking-wider">← BACK TO LAB</a>
          <div className="text-5xl mb-4">{data.icon}</div>
          <h1 className="text-4xl md:text-5xl font-black orbitron tracking-tighter mb-2 bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
            {data.title}
          </h1>

          <div className="mt-10 space-y-10">
            {data.sections.map((section, i) => (
              <div key={i} className="border-l-2 border-cyan-500/20 pl-6 hover:border-cyan-400/60 transition-all">
                <h2 className="text-lg md:text-xl font-bold text-white mb-3 orbitron tracking-wider">{section.h}</h2>
                <p className="text-sm text-gray-400 leading-relaxed">{section.p}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="pb-6 text-center opacity-30 text-[10px] uppercase tracking-widest">
          NeuroFlux v1.0 | Educational Stream
        </div>
      </div>
      <style jsx global>{`
        body { margin: 0; padding: 0; background-color: #050505; font-family: 'JetBrains Mono', monospace; overflow-x: hidden; color: white; }
        h1, h2, .orbitron { font-family: 'Orbitron', sans-serif; }
        .scanlines { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%), linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06)); background-size: 100% 4px, 3px 100%; pointer-events: none; z-index: 50; }
        #hero-canvas { position: fixed; top: 0; left: 0; z-index: 0; }
        .ui-layer { position: relative; z-index: 10; }
      `}</style>
    </>
  );
}
