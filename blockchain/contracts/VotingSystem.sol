// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract VotingSystem {

    struct Voter {
        bool hasVotedUniversity;
        bool hasVotedCollege;
        string universityVoteHash;
        string collegeVoteHash;
    }

    struct UniversityBloc {
        uint256 id;
        uint256 voteCount;
    }

    struct CollegeBloc {
        uint256 id;
        uint256 voteCount;
    }

    // ---------------------------
    // ✅ State Variables
    // ---------------------------

    mapping(address => Voter) public voters;
    mapping(string => bool) public voteHashes;
    mapping(bytes32 => bool) public emailHasVoted; // ✅ Email-based double-voting protection

    UniversityBloc[] public universityBlocs;
    CollegeBloc[] public collegeBlocs;

    // ---------------------------
    // ✅ Events
    // ---------------------------

    event UniversityBlocAdded(string message, uint256 blocId);
    event CollegeBlocAdded(string message, uint256 blocId);
    event VoteCast(address voter, string voteHash, string voteType); // "university" or "college"

    // ---------------------------
    // ✅ Bloc Management Functions
    // ---------------------------

    function addUniversityBloc(uint256 blocId) public {
        universityBlocs.push(UniversityBloc(blocId, 0));
        emit UniversityBlocAdded("University Bloc Added", blocId);
    }

    function addCollegeBloc(uint256 blocId) public {
        collegeBlocs.push(CollegeBloc(blocId, 0));
        emit CollegeBlocAdded("College Bloc Added", blocId);
    }

    // ---------------------------
    // ✅ Voting Functions
    // ---------------------------

    function vote(bytes32 emailHash, string memory voteHash, uint256 blocId) public {
        require(!voters[msg.sender].hasVotedUniversity, "Already voted for university bloc.");
        require(!emailHasVoted[emailHash], "Email already used to vote.");

        voters[msg.sender].hasVotedUniversity = true;
        voters[msg.sender].universityVoteHash = voteHash;
        voteHashes[voteHash] = true;
        emailHasVoted[emailHash] = true;

        universityBlocs[blocId - 1].voteCount++;

        emit VoteCast(msg.sender, voteHash, "university");
    }

    function voteCollegeBloc(string memory voteHash, uint8 blocId) public {
        require(!voters[msg.sender].hasVotedCollege, "Already voted for college bloc.");

        voters[msg.sender].hasVotedCollege = true;
        voters[msg.sender].collegeVoteHash = voteHash;
        voteHashes[voteHash] = true;

        collegeBlocs[blocId - 1].voteCount++;

        emit VoteCast(msg.sender, voteHash, "college");
    }

    // ---------------------------
    // ✅ Read Functions
    // ---------------------------

    function getUniversityBloc(uint256 blocId) public view returns (uint256, uint256) {
        require(blocId > 0 && blocId <= universityBlocs.length, "Invalid bloc.");
        UniversityBloc memory bloc = universityBlocs[blocId - 1];
        return (bloc.id, bloc.voteCount);
    }

    function getCollegeBloc(uint256 blocId) public view returns (uint256, uint256) {
        require(blocId > 0 && blocId <= collegeBlocs.length, "Invalid bloc.");
        CollegeBloc memory bloc = collegeBlocs[blocId - 1];
        return (bloc.id, bloc.voteCount);
    }
}