# VibePoint Ad Tool

> Helping creators intelligently insert ads in online videos and vibes

An AI-powered platform that analyzes viewer reactions and emotional beats in videos to dynamically select and place contextually relevant ads.

## Links

- **GitHub Repository**: https://github.com/leopiney/ny-hackathon-twelvelabs
- **Devpost Submission**: https://devpost.com/software/vibe-point
- **Hackathon**: [Generative AI in Advertising Hackathon - AdWeek NYC](https://gen-ai-advertising-nyc.devpost.com/)

## About the Hackathon

VibePoint was built during the **Generative AI in Advertising Hackathon** at AdWeek NYC (October 4-5, 2025), hosted at Betaworks in New York City. The hackathon challenged participants to transform the $800B advertising industry with AI, focusing on:

- Creative & Production Workflows
- Brand Safety & Suitability
- Identity & Contextual Advertising
- Performance Insights & Analytics

Our project addresses the **Identity & Contextual Advertising** category by leveraging TwelveLabs' video understanding APIs to create an enterprise-ready solution that connects emotional context with advertising effectiveness.

## What It Does

VibePoint uses a dual-agent system to revolutionize video advertising by:

- **Analyzing Emotional Context**: Detecting viewer reactions and emotional beats in videos using 12Labs' advanced video analysis
- **Smart Categorization**: Organizing content into emotional moments and segments
- **Dynamic Ad Placement**: Selecting and placing ads based on emotional context rather than traditional demographics
- **Engagement Prediction**: Simulating viewer responses to predict ad performance
- **Detailed Analytics**: Providing comprehensive ad performance insights through an interactive dashboard

## The Problem

Modern video advertising faces two critical challenges:
- Ads are often irrelevant and disruptive to viewer experience
- Current targeting solutions fail to capture emotional engagement and context

## Our Solution

VibePoint bridges the gap between content creators and advertisers by ensuring ads align with the emotional tone of content, creating a more natural and effective advertising experience.

### Architecture

1. **Emotional Extraction Layer** (12Labs) - Analyzes video content for emotional signals
2. **Segment Labeling Engine** - Categorizes content into emotional moments
3. **AI-Powered Ad Matching** (GPT-based) - Matches ads to emotional context
4. **Viewer Response Simulation** - Predicts emotional resonance and engagement
5. **Analytics Dashboard** - Visualizes performance metrics and insights

## Key Accomplishments

- ✅ Integrated 12Labs' emotional analysis with GPT-based ad matching
- ✅ Built a simulation engine that predicts emotional resonance
- ✅ Created an ethical system that aligns brands with content values
- ✅ Proved that emotional context is more powerful than demographic targeting

## What's Next

- 🎯 Enhance precision of emotional detection algorithms
- 📈 Expand training across diverse content types and genres
- 🤝 Improve ad-content matching with advanced ML models
- 🚀 Scale the platform with robust API integrations
- 💼 Seek strategic partnerships and investment opportunities

## Technology Stack

- **Frontend**: Next.js
- **Backend**: Python, FastAPI
- **Video Analysis**: TwelveLabs API
- **AI Matching**: GPT-based algorithms
- **Cloud Storage**: AWS S3

## Project Structure

- **amber_aim/**: FastAPI backend service for video processing, emotional analysis, and ad matching
- **amber_aim_web/**: Next.js web application with analytics dashboard

## Getting Started

See the individual README files in each directory for setup instructions:

- [Backend Setup (amber_aim)](./amber_aim/README.md)
- [Frontend Setup (amber_aim_web)](./amber_aim_web/README.md)

## Team

- Rob Kleiman
- Sarah Yu
- Leonardo Piñeyro
- Lan Mi

## License

MIT
