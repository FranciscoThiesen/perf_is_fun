/* ----------------------------------------------------------------------------
 * Performance Engineering Roadmap — graph + checklist data
 * One source of truth. `app.js` turns this into the knowledge graph and panels.
 *
 * A "phase" is a hub node on the central spine. Each phase has `skills`
 * (satellite nodes) that branch off it. Every node carries `items`
 * (the tickable checklist) and optional `links` (resources for the panel).
 *
 * An item is either a string, or { t: text, done: true } to pre-check it.
 * -------------------------------------------------------------------------- */

window.ROADMAP = {
  title: "Performance Engineering Roadmap",
  subtitle: "12 months → frontier-lab performance / kernel engineer",

  phases: [
    {
      id: "method",
      tag: "THE METHOD",
      title: "The Method",
      goal: "Learn durably, not just fluently. Apply weekly.",
      color: "#8b5cf6",
      items: [
        "Open a prediction log: every entry is predicted → actual → why the gap",
        "Adopt predict-then-diff before every pass, kernel, or profile run",
        "Use AI as grader/tutor, never first-draft author, inside a learning window",
        "First-attempt-then-contrast: write yours first, then study the diff",
        "Use AI freely as a reader of machine output (ncu traces, dense papers)",
        "Weekly closed-book schema retrieval (the maintenance deck)",
      ],
      links: [
        ["Gen-AI without guardrails harms learning (PNAS 2025)", "https://www.pnas.org/doi/10.1073/pnas.2422633122"],
        ["How AI Impacts Skill Formation (2026)", "https://arxiv.org/abs/2601.20245"],
        ["METR: felt 20% faster, were 19% slower", "https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/"],
      ],
    },

    {
      id: "m1",
      tag: "MONTH 1",
      title: "Performance Arithmetic",
      goal: "Compute any roofline & transformer cost from memory.",
      color: "#06b6d4",
      items: [
        "Deliverable: one-page closed-book performance cheat sheet, then checked",
      ],
      links: [
        ["Making Deep Learning Go Brrrr — Horace He", "https://horace.io/brrr_intro.html"],
        ["GPU MODE — YouTube", "https://www.youtube.com/@GPUMODE"],
        ["PMPP, 4th ed. (reference)", "https://www.sciencedirect.com/book/9780323912310/programming-massively-parallel-processors"],
      ],
      skills: [
        {
          id: "m1-roofline",
          title: "Roofline Model",
          items: [
            "Read the Roofline paper (Williams, Waterman, Patterson) — twice",
            "Derive the H100 ridge point (~300 FLOPs/byte)",
            "Prove prefill is compute-bound, decode memory-bound, from arithmetic intensity",
            "Plot one roofline: measured vs theoretical bandwidth",
          ],
          links: [
            ["Roofline paper", "https://dl.acm.org/doi/10.1145/1498765.1498785"],
          ],
        },
        {
          id: "m1-arith",
          title: "Transformer Arithmetic",
          items: [
            { t: "Read \"Making Deep Learning Go Brrrr\" (Horace He)", done: true },
            "Read Transformer Inference Arithmetic (kipply)",
            "Read the relevant roofline/TPU/transformer parts of the JAX Scaling Book",
            "Write KV-cache bytes & per-token FLOPs as functions of (B, S, L, H, d)",
            "Compute MFU for a given config",
          ],
          links: [
            ["Transformer Inference Arithmetic — kipply", "https://kipp.ly/transformer-inference-arithmetic/"],
            ["How to Scale Your Model (JAX/TPU)", "https://jax-ml.github.io/scaling-book/"],
          ],
        },
        {
          id: "m1-exec",
          title: "Execution Model & Specs",
          items: [
            "Internalize one GPU spec sheet (H100: BF16 FLOPs, HBM BW, SRAM, NVLink)",
            "Internalize one TPU spec sheet",
            "Hopper whitepaper: TMA, warp specialization, async copy, tensor-core shapes",
            "Blackwell page: FP4, what changed after Hopper",
            "Write a C program measuring achieved memory bandwidth vs theoretical",
          ],
          links: [
            ["Hopper architecture whitepaper", "https://resources.nvidia.com/en-us-tensor-core"],
            ["Blackwell architecture page", "https://resources.nvidia.com/en-us-blackwell-architecture"],
          ],
        },
      ],
    },

    {
      id: "m2",
      tag: "MONTH 2",
      title: "CUDA + Profilers",
      goal: "Write, profile & explain kernels; predict the bottleneck first.",
      color: "#3b82f6",
      items: [
        "Deliverable: worklog naive → tiled matmul, with profiles + prediction-vs-actual",
        "Remember: nvprof is dead — nsys + ncu only",
      ],
      links: [
        ["CUDA Toolkit", "https://developer.nvidia.com/cuda-downloads"],
        ["CUDA C++ Programming Guide", "https://docs.nvidia.com/cuda/cuda-c-programming-guide/"],
        ["CUDA samples", "https://github.com/NVIDIA/cuda-samples"],
      ],
      skills: [
        {
          id: "m2-kernels",
          title: "CUDA Kernels",
          items: [
            "Vector add",
            "Naive matmul",
            "Fix coalescing",
            "Shared-memory tiled matmul",
            "Compare each against cuBLAS",
          ],
        },
        {
          id: "m2-prof",
          title: "Profiler Fluency",
          items: [
            "Read the Nsight Compute Kernel Profiling Guide",
            "Read Nsight Systems docs (timeline: launches, copies, gaps)",
            "Narrate the ncu rules output for each kernel",
            "Before each ncu run, write the predicted limiter; score yourself",
          ],
          links: [
            ["Nsight Compute — Profiling Guide", "https://docs.nvidia.com/nsight-compute/ProfilingGuide/"],
            ["Nsight Systems docs", "https://docs.nvidia.com/nsight-systems/"],
          ],
        },
        {
          id: "m2-anti",
          title: "Anti-patterns",
          items: [
            "Create then detect an uncoalesced access pattern",
            "Create then detect a shared-memory bank conflict",
            "Create then detect a divergent warp",
          ],
        },
      ],
    },

    {
      id: "m34",
      tag: "MONTHS 3–4",
      title: "MLIR + Triton",
      goal: "MLIR from zero; Triton as user, then through its compiler.",
      color: "#10b981",
      items: [
        "Deliverable: closed-book reproduction of the lowering graph",
        "Deliverable: walkthrough \"my matmul from tl.dot to PTX\"",
      ],
      links: [
        ["MLIR CGO'21 paper", "https://arxiv.org/abs/2002.11054"],
        ["MLIR Toy tutorial", "https://mlir.llvm.org/docs/Tutorials/Toy/"],
        ["MLIR for Beginners — Jeremy Kun", "https://github.com/j2kun/mlir-tutorial"],
      ],
      skills: [
        {
          id: "m34-mlir",
          title: "MLIR Core",
          items: [
            "LangRef + Understanding the IR Structure + Toy tutorial",
            "Pattern Rewriting (read → explain back → 1-page closed-book)",
            "Dialect Conversion",
            "Bufferization",
            "Linalg dialect + rationale + Transform dialect tutorial",
            "Pass Infrastructure",
            "Drill mlir/test: cover CHECK lines, predict IR, run mlir-opt, diff",
          ],
          links: [
            ["LangRef", "https://mlir.llvm.org/docs/LangRef/"],
            ["mlir/test drill deck", "https://github.com/llvm/llvm-project/tree/main/mlir/test"],
          ],
        },
        {
          id: "m34-lower",
          title: "Lowering Pipeline",
          items: [
            "canonicalize / CSE on arith + scf",
            "scf-to-cf",
            "linalg named → generic + elementwise fusion",
            "transform-dialect tiling",
            "one-shot-bufferize",
            "vectorization",
          ],
        },
        {
          id: "m34-triton-user",
          title: "Triton (User)",
          items: [
            "Official tutorials 01–06: vec add → softmax → matmul → fused attention",
            "Triton-Puzzles (Sasha Rush) for retrieval practice",
            "Read Liger-Kernel as clean production Triton",
            "Skim Helion for how it layers above Triton",
          ],
          links: [
            ["Triton tutorials", "https://triton-lang.org/main/getting-started/tutorials/index.html"],
            ["Triton-Puzzles", "https://github.com/srush/Triton-Puzzles"],
            ["Liger-Kernel", "https://github.com/linkedin/Liger-Kernel"],
          ],
        },
        {
          id: "m34-triton-comp",
          title: "Triton (Compiler)",
          items: [
            "Run your kernels with MLIR_ENABLE_DUMP=1",
            "Narrate ttir → ttgir → llir → PTX",
            "Study layouts / encodings, the pipelining pass, coalescing",
            "Triangulate matmul: your CUDA vs your Triton vs cuBLAS — explain every gap",
          ],
          links: [
            ["Triton repo", "https://github.com/triton-lang/triton"],
          ],
        },
      ],
    },

    {
      id: "m56",
      tag: "MONTHS 5–6",
      title: "Deep Optimization",
      goal: "Close the gap between \"runs\" and \"near peak\".",
      color: "#f59e0b",
      items: [
        "Deliverable: matmul within a respectable factor of cuBLAS + step-by-step writeup",
        "Deliverable: FlashAttention-lite — fused attention on a toy problem",
        "Deliverable: one annotated SASS reading of your own kernel",
      ],
      links: [
        ["NVIDIA On-Demand (GTC talks)", "https://www.nvidia.com/en-us/on-demand/"],
      ],
      skills: [
        {
          id: "m56-matmul",
          title: "Matmul to Peak",
          items: [
            "Work Simon Boehm's CUDA MMM as predict-then-diff",
            "Warp shuffles & shuffle-based reductions",
            "The occupancy myth & register pressure",
            "Atomics & contention",
            "Prefix scans",
          ],
          links: [
            ["How to Optimize a CUDA Matmul — Simon Boehm", "https://siboehm.com/articles/22/CUDA-MMM"],
          ],
        },
        {
          id: "m56-flash",
          title: "FlashAttention",
          items: [
            "Read FlashAttention (1)",
            "Read FlashAttention-2",
            "Read FlashAttention-3",
            "Read the reference implementation",
            "Build FlashAttention-lite on a toy problem (FA1–3 as schema)",
          ],
          links: [
            ["FlashAttention", "https://arxiv.org/abs/2205.14135"],
            ["FlashAttention-2", "https://arxiv.org/abs/2307.08691"],
            ["FlashAttention-3", "https://arxiv.org/abs/2407.08608"],
            ["Reference implementation", "https://github.com/Dao-AILab/flash-attention"],
          ],
        },
        {
          id: "m56-tc",
          title: "Tensor Cores & CUTLASS",
          items: [
            "Tensor cores: WMMA → PTX mma → CUTLASS",
            "CUTLASS + CuTe: hierarchical GEMM, custom epilogues",
            "Async copy / TMA",
            "Vertical vs horizontal fusion and its occupancy limits",
          ],
          links: [
            ["CUTLASS + CuTe", "https://github.com/NVIDIA/cutlass"],
          ],
        },
        {
          id: "m56-sass",
          title: "SASS & PTX",
          items: [
            "PTX ISA reference: mma shapes, cp.async",
            "cuobjdump / nvdisasm for reading SASS",
            "One annotated SASS reading of your own kernel",
          ],
          links: [
            ["PTX ISA reference", "https://docs.nvidia.com/cuda/parallel-thread-execution/"],
            ["CUDA Binary Utilities", "https://docs.nvidia.com/cuda/cuda-binary-utilities/"],
          ],
        },
      ],
    },

    {
      id: "m78",
      tag: "MONTHS 7–8",
      title: "JAX / XLA / Pallas",
      goal: "The TPU-first stack the target actually runs.",
      color: "#ec4899",
      items: [
        "Deliverable: side-by-side writeup of one kernel in Triton (GPU) and Pallas (TPU), with the IR each pipeline produces",
      ],
      links: [
        ["JAX docs", "https://docs.jax.dev/"],
        ["Kaggle TPUs (free)", "https://www.kaggle.com/docs/tpu"],
        ["TPU Research Cloud", "https://sites.research.google/trc/about/"],
      ],
      skills: [
        {
          id: "m78-jax",
          title: "JAX & XLA",
          items: [
            "Write a transformer block in JAX",
            "Predict its StableHLO before jit(f).lower(x).as_text()",
            "Diff the optimized HLO from .compile() — that diff is XLA's fusion/layout",
            "Read the GSPMD paper",
          ],
          links: [
            ["StableHLO", "https://openxla.org/stablehlo"],
            ["XLA architecture", "https://openxla.org/xla/architecture"],
            ["GSPMD paper", "https://arxiv.org/abs/2105.04663"],
          ],
        },
        {
          id: "m78-pallas",
          title: "Pallas & Mosaic",
          items: [
            "Pallas docs + quickstart",
            "Port your month-3 softmax & attention kernels to Pallas",
            "Run on TPU via Mosaic",
            "Inspect the IR it emits (your MLIR investment compounding)",
          ],
          links: [
            ["Pallas docs", "https://docs.jax.dev/en/latest/pallas/index.html"],
          ],
        },
        {
          id: "m78-shard",
          title: "Sharding & Collectives",
          items: [
            "Read the sharding/collectives chapters of the Scaling Book",
            "shard_map exercise: tensor-parallel matmul across TPU cores",
            "Reason about the collective costs first",
            "JAX profiling: XProf / TensorBoard trace viewer",
          ],
          links: [
            ["shard_map notebook", "https://docs.jax.dev/en/latest/notebooks/shard_map.html"],
            ["JAX profiling", "https://docs.jax.dev/en/latest/profiling.html"],
          ],
        },
        {
          id: "m78-trn",
          title: "Trainium Weekend",
          items: [
            "AWS Neuron docs → architecture guide",
            "Read one NKI kernel (depth can wait)",
          ],
          links: [
            ["AWS Neuron docs", "https://awsdocs-neuron.readthedocs-hosted.com/en/latest/"],
            ["NKI", "https://awsdocs-neuron.readthedocs-hosted.com/en/latest/general/nki/index.html"],
          ],
        },
      ],
    },

    {
      id: "m912",
      tag: "MONTHS 9–12",
      title: "Inference & Capstone",
      goal: "Production inference internals + public proof of skill.",
      color: "#ef4444",
      items: [
        "Capstone: take a 1–8B open model; own its decode path end-to-end",
        "Every change: a roofline-justified before/after in tokens/sec and MFU",
        "PUBLISH the writeup — it is your application artifact",
      ],
      links: [
        ["Anthropic careers", "https://www.anthropic.com/careers"],
        ["TPU Kernel Engineer posting", "https://job-boards.greenhouse.io/anthropic/jobs/4720576008"],
      ],
      skills: [
        {
          id: "m912-infer",
          title: "Inference Internals",
          items: [
            "Read nano-vLLM fully (~1,200 lines, one weekend)",
            "vLLM: block tables, scheduler, prefix caching",
            "PagedAttention paper",
            "Orca: continuous batching (OSDI'22)",
          ],
          links: [
            ["nano-vLLM", "https://github.com/GeeeekExplorer/nano-vllm"],
            ["vLLM", "https://github.com/vllm-project/vllm"],
            ["PagedAttention paper", "https://arxiv.org/abs/2309.06180"],
            ["Orca (OSDI'22)", "https://www.usenix.org/conference/osdi22/presentation/yu"],
          ],
        },
        {
          id: "m912-opt",
          title: "Inference Optimizations",
          items: [
            "Speculative decoding (Leviathan et al.; Chen et al.)",
            "Quantization: GPTQ, AWQ, SmoothQuant",
            "FP8 Formats for Deep Learning",
            "FlexAttention — custom attention without CUDA",
          ],
          links: [
            ["Speculative decoding (Leviathan)", "https://arxiv.org/abs/2211.17192"],
            ["AWQ", "https://arxiv.org/abs/2306.00978"],
            ["FlexAttention", "https://pytorch.org/blog/flexattention/"],
          ],
        },
        {
          id: "m912-train",
          title: "Training Schema (deck)",
          items: [
            "Megatron-LM (for the deck, not deep study)",
            "ZeRO (for the deck, not deep study)",
          ],
          links: [
            ["Megatron-LM", "https://arxiv.org/abs/1909.08053"],
            ["ZeRO", "https://arxiv.org/abs/1910.02054"],
          ],
        },
        {
          id: "m912-oss",
          title: "Open Source (your edge)",
          items: [
            "A Triton compiler PR (not just a kernel) — this makes a hiring manager look twice",
            "A Liger-Kernel or vLLM kernel PR alongside",
            "One upstream MLIR patch if it falls naturally out of months 3–4",
          ],
          links: [
            ["Triton", "https://github.com/triton-lang/triton"],
            ["llvm-project (MLIR)", "https://github.com/llvm/llvm-project"],
          ],
        },
        {
          id: "m912-capstone",
          title: "Capstone",
          items: [
            "Profile the decode path end-to-end",
            "Fused attention + KV cache",
            "Continuous / paged batching",
            "A low-precision variant",
            "Before/after in tokens/sec & MFU, roofline-justified",
            "Publish the writeup",
          ],
        },
      ],
    },
  ],

  // The closed-book maintenance deck (§9) — shown as its own panel.
  maintenance: {
    title: "Weekly Maintenance",
    note: "15 min, closed book, rotate.",
    items: [
      "The MLIR lowering graph, from memory",
      "One GPU + one TPU spec sheet; ridge points",
      "Transformer layer memory/FLOP math as functions of (B, S, L, H, d)",
      "Collective costs: ring vs tree all-reduce as functions of size & bandwidth",
      "Concept deck: FlashAttention 1–3, PagedAttention, Megatron TP/PP, GSPMD, ZeRO, speculative decoding, PTQ vs QAT, FP8",
    ],
  },
};
