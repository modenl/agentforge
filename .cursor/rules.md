# Cursor AI Assistant Rules for Screen Control Agents Project

## 🚫 CRITICAL DOCUMENTATION RULES
- **STOP AND ASK FIRST** - Before creating ANY new file ending in .md, .txt, .doc, or any documentation
- **NO EXCEPTIONS** - Even if it seems "helpful" or "related" to the task
- **PAUSE AND CONFIRM** - Always ask: "Should I create a [filename] to document this?"
- **ONE TASK AT A TIME** - Complete the requested task first, then separately ask about documentation
- **NEVER ASSUME** - Don't assume documentation is wanted just because you added a feature

### Mandatory Checks Before Creating Documentation:
1. **STOP** - Is this a .md, .txt, .rst, .doc file?
2. **ASK** - "Do you want me to create documentation for this?"
3. **WAIT** - For explicit approval before proceeding
4. **SEPARATE** - Handle documentation as a separate task

## 📝 Code Modification Guidelines
- Always ask before making major architectural changes
- Prefer editing existing files over creating new ones
- When creating new CODE files, ask for confirmation first
- Keep changes focused and minimal
- Test builds after significant changes

## 🔍 Debug and Logging Rules
- Remove excessive debug logs that impact performance
- Keep error handling and critical logs
- Don't add verbose console.log statements without request
- Focus on clean, production-ready code

## 📁 File Organization
- Follow existing project structure
- Don't reorganize files without explicit request
- Respect the current folder hierarchy
- Ask before adding new directories

## 🛠️ Development Practices
- Always verify code changes with build tests
- Preserve existing functionality when refactoring
- Comment complex logic but avoid over-commenting
- Use consistent coding style with existing codebase

## 🎯 Project-Specific Rules
- This is an Electron app with Svelte frontend
- Adaptive cards should follow single-card paradigm (0 or 1 cards only)
- Streaming performance is critical - avoid performance-impacting logs
- Maintain compatibility with existing GPT agent integration

## 💬 Communication
- Ask clarifying questions when requirements are unclear
- Confirm before making destructive changes
- Explain the impact of proposed changes
- Suggest alternatives when appropriate
- **ALWAYS ASK** before creating documentation files

## ❌ What NOT to do
- Don't create README files, guides, or tutorials without being asked
- Don't add new dependencies without discussion
- Don't remove existing functionality without confirmation
- Don't create "helpful" documentation automatically
- Don't reorganize project structure unilaterally
- **NEVER create .md files in the same response as code changes**
- **NEVER assume documentation is wanted**

## ✅ What TO do
- Focus on the specific task requested
- Make minimal, targeted changes
- Preserve existing functionality
- Ask for guidance when uncertain
- Test changes when possible
- **Ask separately about documentation after completing the main task**

## 🛑 REMINDER BEFORE EVERY FILE CREATION
**Before creating ANY file, ask yourself:**
1. Is this a documentation file? (.md, .txt, .doc, etc.)
2. Was I specifically asked to create documentation?
3. Should I ask permission first?

**If ANY answer is yes to #1 and no to #2, then STOP and ASK FIRST.** 